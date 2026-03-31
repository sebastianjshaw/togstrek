/**
 * Shared helpers: fetch CDN image bytes, extract EXIF (exifr + sharp fallback),
 * build a camera-style caption string (same logic as the probe script).
 */

import { parse as exifrParse } from "exifr";
import sharp from "sharp";

export const TOGSTREK_MEDIA_HOST = "media.togstrek.com";

/** `ifd0` must be `FormatOptions` (not boolean) per exifr typings. */
export const EXIFR_PARSE_OPTIONS = {
  translateKeys: true,
  translateValues: true,
  reviveValues: true,
  mergeOutput: true,
  tiff: true,
  ifd0: {},
  exif: true,
  gps: false,
  icc: false,
  iptc: false,
  jfif: false,
  xmp: false,
} as NonNullable<Parameters<typeof exifrParse>[1]>;

function formatExposureTime(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number") {
    if (!Number.isFinite(v) || v <= 0) return null;
    if (v >= 1) return `${Number.isInteger(v) ? v : v.toFixed(1)}s`;
    const inv = Math.round(1 / v);
    return `1/${inv}`;
  }
  if (typeof v === "string") return v;
  return null;
}

function formatFocalLength(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    const n = v > 1000 ? v / 1000 : v;
    const rounded = Number.isInteger(n) ? String(n) : n.toFixed(1);
    return `${rounded}mm`;
  }
  return null;
}

function formatFNumber(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  if (typeof v === "number" && Number.isFinite(v)) {
    const s = Number.isInteger(v) ? String(v) : v.toFixed(1);
    return `f/${s}`;
  }
  return null;
}

/** Same line style as hand-written MDX (Canon EOS …, 17mm, f11, 1/200, ISO100). */
export function buildSuggestedCaptionFromExif(
  tags: Record<string, unknown>,
): string | null {
  const make = tags.Make ?? tags.make;
  const model = tags.Model ?? tags.model;
  const lens =
    tags.LensModel ?? tags.Lens ?? tags.lens ?? tags.LensID ?? tags.LensMake;
  const focal = formatFocalLength(tags.FocalLength ?? tags.FocalLengthIn35mmFormat);
  const fn = formatFNumber(tags.FNumber ?? tags.ApertureValue);
  const exp = formatExposureTime(tags.ExposureTime ?? tags.ShutterSpeedValue);
  const iso = tags.ISO ?? tags.ISOSpeedRatings ?? tags.PhotographicSensitivity;

  const head: string[] = [];
  if (typeof make === "string" && make.trim()) head.push(make.trim());
  if (typeof model === "string" && model.trim()) {
    const m = model.trim();
    if (!head.length || !head[0]!.includes(m)) head.push(m);
  }
  if (typeof lens === "string" && lens.trim()) head.push(lens.trim());

  const tail: string[] = [];
  if (focal) tail.push(focal);
  if (fn) tail.push(fn.replace("f/", "f"));
  if (exp) tail.push(exp);
  if (typeof iso === "number" && Number.isFinite(iso)) tail.push(`ISO${Math.round(iso)}`);

  if (!head.length && !tail.length) return null;
  const a = head.join(" ").replace(/\s+/g, " ").trim();
  const b = tail.join(", ");
  if (a && b) return `${a}, ${b}`;
  return a || b || null;
}

/**
 * JPEG/PNG/etc: `exifr` reads the file directly.
 * WebP (often wrongly named `.jpg`): `exifr` fails — use `sharp` to read embedded EXIF TIFF.
 */
export async function extractExifTags(buf: ArrayBuffer): Promise<{
  tags: Record<string, unknown> | null;
  source: "exifr_direct" | "sharp_exif_tiff" | null;
  lastError?: string;
}> {
  const u8 = new Uint8Array(buf);
  try {
    const tags = await exifrParse(u8, EXIFR_PARSE_OPTIONS);
    if (tags && typeof tags === "object") {
      const keys = Object.keys(tags).filter((k) => tags[k as keyof typeof tags] !== undefined);
      if (keys.length > 0) {
        return { tags: tags as Record<string, unknown>, source: "exifr_direct" };
      }
    }
  } catch {
    /* fall through to sharp */
  }

  try {
    const m = await sharp(Buffer.from(buf)).metadata();
    if (!m.exif || m.exif.length < 10) {
      return {
        tags: null,
        source: null,
        lastError: "No embedded EXIF segment (sharp)",
      };
    }
    const tiff = m.exif.subarray(6);
    const tags = await exifrParse(tiff, EXIFR_PARSE_OPTIONS);
    if (tags && typeof tags === "object") {
      const keys = Object.keys(tags).filter((k) => tags[k as keyof typeof tags] !== undefined);
      if (keys.length > 0) {
        return { tags: tags as Record<string, unknown>, source: "sharp_exif_tiff" };
      }
    }
    return { tags: null, source: null, lastError: "EXIF segment empty after parse" };
  } catch (e) {
    return {
      tags: null,
      source: null,
      lastError: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function fetchImageBuffer(
  url: string,
  ms = 45_000,
): Promise<{ ok: boolean; status: number; buf?: ArrayBuffer; err?: string }> {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), ms);
  try {
    const res = await fetch(url, {
      signal: ac.signal,
      headers: { Accept: "image/*,*/*" },
    });
    clearTimeout(t);
    if (!res.ok) return { ok: false, status: res.status, err: `HTTP ${res.status}` };
    const buf = await res.arrayBuffer();
    return { ok: true, status: res.status, buf };
  } catch (e) {
    clearTimeout(t);
    return {
      ok: false,
      status: 0,
      err: e instanceof Error ? e.message : String(e),
    };
  }
}

/** Escape `]` and `\` for safe use inside markdown `![alt](url)` alt text. */
export function escapeMarkdownImageAlt(alt: string): string {
  return alt.replace(/\\/g, "\\\\").replace(/\]/g, "\\]");
}

/**
 * Fetch image and return camera-style caption, or `null` if unavailable.
 */
export async function fetchExifCaptionForMediaUrl(
  url: string,
): Promise<string | null> {
  const r = await fetchImageBuffer(url, 45_000);
  if (!r.ok || !r.buf) return null;
  const extracted = await extractExifTags(r.buf);
  if (!extracted.tags) return null;
  return buildSuggestedCaptionFromExif(extracted.tags);
}
