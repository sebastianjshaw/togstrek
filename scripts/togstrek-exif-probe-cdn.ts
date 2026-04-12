/**
 * Fetch unique `media.togstrek.com` image URLs from nested `content/places` MDX,
 * parse EXIF with `exifr`, and write a JSON report under `migration/`.
 *
 * Usage:
 *   npx tsx scripts/togstrek-exif-probe-cdn.ts
 *   npx tsx scripts/togstrek-exif-probe-cdn.ts --limit 300
 *   npx tsx scripts/togstrek-exif-probe-cdn.ts --concurrency 4 --delay-ms 150
 */

import fs from "node:fs";
import path from "node:path";

import {
  buildSuggestedCaptionFromExif,
  extractExifTags,
  fetchImageBuffer,
  TOGSTREK_MEDIA_HOST,
} from "./lib/togstrek-exif-from-url";
import { shouldReplaceAltWithExif } from "@/lib/togstrek-mdx-image-caption";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");
const REPORT_PATH = path.join(process.cwd(), "migration", "exif-probe-report.json");

type Row = {
  url: string;
  status: "ok" | "partial" | "no_exif" | "fetch_error" | "parse_error";
  httpStatus?: number;
  error?: string;
  raw?: Record<string, unknown>;
  suggestedCaption?: string;
  extractionSource?: "exifr_direct" | "sharp_exif_tiff";
};

function parseArgs(): { limit: number; concurrency: number; delayMs: number } {
  const a = process.argv.slice(2);
  let limit = 0;
  let concurrency = 4;
  let delayMs = 120;
  for (let i = 0; i < a.length; i++) {
    if (a[i] === "--limit" && a[i + 1]) {
      limit = Math.max(0, Number.parseInt(a[i + 1]!, 10) || 0);
      i++;
    } else if (a[i] === "--concurrency" && a[i + 1]) {
      concurrency = Math.max(1, Math.min(16, Number.parseInt(a[i + 1]!, 10) || 4));
      i++;
    } else if (a[i] === "--delay-ms" && a[i + 1]) {
      delayMs = Math.max(0, Number.parseInt(a[i + 1]!, 10) || 0);
      i++;
    }
  }
  return { limit, concurrency, delayMs };
}

function walkMdxFiles(dir: string, out: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdxFiles(full, out);
    else if (ent.isFile() && ent.name.endsWith(".mdx")) out.push(full);
  }
}

const MD_IMG = /!\[[^\]]*]\((https?:\/\/[^)\s]+)\)/g;

/** Same as `exif:fill-mdx`: `![](https://media.togstrek.com/...)` only. */
const MD_IMG_EMPTY_ALT_MEDIA = new RegExp(
  String.raw`!\[\]\(\s*(https://${TOGSTREK_MEDIA_HOST.replace(/\./g, String.raw`\.`)}[^)\s]+)\s*\)`,
  "g",
);

/** `![alt](https://media.togstrek.com/...)` — groups: alt, url (same as fill script). */
const MD_IMG_MEDIA_WITH_ALT = new RegExp(
  String.raw`!\[([^\]]*)\]\(\s*(https://${TOGSTREK_MEDIA_HOST.replace(/\./g, String.raw`\.`)}[^)\s]+)\s*\)`,
  "g",
);

function collectMediaUrls(): {
  allUrls: string[];
  emptyAltUrls: string[];
  replaceableExifAltUrls: string[];
} {
  const files: string[] = [];
  if (!fs.existsSync(PLACES_ROOT)) {
    console.error("Missing", PLACES_ROOT);
    return { allUrls: [], emptyAltUrls: [], replaceableExifAltUrls: [] };
  }
  walkMdxFiles(PLACES_ROOT, files);
  const seenAll = new Set<string>();
  const seenEmpty = new Set<string>();
  const seenReplaceable = new Set<string>();
  const allUrls: string[] = [];
  const emptyAltUrls: string[] = [];
  const replaceableExifAltUrls: string[] = [];
  for (const fp of files) {
    const text = fs.readFileSync(fp, "utf8");
    let m: RegExpExecArray | null;
    MD_IMG.lastIndex = 0;
    while ((m = MD_IMG.exec(text))) {
      const u = m[1]!.replace(/[)\s]+$/, "").trim();
      if (!u.includes(TOGSTREK_MEDIA_HOST)) continue;
      if (!seenAll.has(u)) {
        seenAll.add(u);
        allUrls.push(u);
      }
    }
    MD_IMG_EMPTY_ALT_MEDIA.lastIndex = 0;
    while ((m = MD_IMG_EMPTY_ALT_MEDIA.exec(text))) {
      const u = m[1]!.trim();
      if (!seenEmpty.has(u)) {
        seenEmpty.add(u);
        emptyAltUrls.push(u);
      }
    }
    MD_IMG_MEDIA_WITH_ALT.lastIndex = 0;
    while ((m = MD_IMG_MEDIA_WITH_ALT.exec(text))) {
      const altRaw = m[1] ?? "";
      const u = m[2]!.trim();
      if (!shouldReplaceAltWithExif(altRaw)) continue;
      if (!seenReplaceable.has(u)) {
        seenReplaceable.add(u);
        replaceableExifAltUrls.push(u);
      }
    }
  }
  allUrls.sort();
  emptyAltUrls.sort();
  replaceableExifAltUrls.sort();
  return { allUrls, emptyAltUrls, replaceableExifAltUrls };
}

function countKeys(tags: Record<string, unknown>, fieldStats: Map<string, number>): void {
  for (const k of Object.keys(tags)) {
    const v = tags[k];
    if (v === undefined || v === null || v === "") continue;
    fieldStats.set(k, (fieldStats.get(k) ?? 0) + 1);
  }
}

async function main(): Promise<void> {
  const { limit, concurrency, delayMs } = parseArgs();
  const { allUrls, emptyAltUrls, replaceableExifAltUrls } = collectMediaUrls();
  const urls = limit > 0 ? allUrls.slice(0, limit) : allUrls;
  const emptyAltSet = new Set(emptyAltUrls);
  const replaceableExifAltSet = new Set(replaceableExifAltUrls);

  if (limit > 0 && limit < allUrls.length) {
    console.warn(
      `Note: --limit ${limit} — okWithCaption / fetchError / etc. only describe the ${limit} probed URLs, not the full ${allUrls.length}. Re-run without --limit for a full report.`,
    );
  }

  console.log(
    `EXIF probe: ${urls.length} unique media.togstrek.com URLs to fetch` +
      (limit > 0 ? ` (capped from ${allUrls.length} total)` : "") +
      ` · ${emptyAltUrls.length} empty-alt · ${replaceableExifAltUrls.length} empty or filename-like alt (exif:fill-mdx scope)` +
      ` · concurrency ${concurrency} · delay ${delayMs}ms`,
  );

  const rows: Row[] = [];
  const fieldStats = new Map<string, number>();

  async function one(url: string): Promise<void> {
    const r = await fetchImageBuffer(url, 45_000);
    if (!r.ok || !r.buf) {
      rows.push({
        url,
        status: "fetch_error",
        httpStatus: r.status,
        error: r.err,
      });
      return;
    }
    try {
      const extracted = await extractExifTags(r.buf);
      if (!extracted.tags) {
        rows.push({
          url,
          status: "no_exif",
          error: extracted.lastError,
        });
        return;
      }
      const o = extracted.tags;
      const keys = Object.keys(o).filter((k) => o[k] !== undefined && o[k] !== "");
      if (keys.length === 0) {
        rows.push({ url, status: "no_exif" });
        return;
      }
      countKeys(o, fieldStats);
      const cap = buildSuggestedCaptionFromExif(o);
      rows.push({
        url,
        status: cap ? "ok" : "partial",
        raw: o,
        suggestedCaption: cap ?? undefined,
        extractionSource: extracted.source ?? undefined,
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      rows.push({
        url,
        status: "parse_error",
        error: msg,
      });
    }
  }

  const queue = [...urls];
  let next = 0;
  let done = 0;

  const workers: Promise<void>[] = [];
  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async () => {
        while (true) {
          const i = next++;
          if (i >= queue.length) break;
          const url = queue[i]!;
          await one(url);
          done++;
          if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
          if (done % 50 === 0 || done === queue.length) {
            process.stdout.write(`  … ${done}/${queue.length}\r`);
          }
        }
      })(),
    );
  }
  await Promise.all(workers);
  process.stdout.write("\n");

  const ok = rows.filter((r) => r.status === "ok").length;
  const partial = rows.filter((r) => r.status === "partial").length;
  const noExif = rows.filter((r) => r.status === "no_exif").length;
  const fetchErr = rows.filter((r) => r.status === "fetch_error").length;
  const parseErr = rows.filter((r) => r.status === "parse_error").length;
  const fromExifr = rows.filter((r) => r.extractionSource === "exifr_direct").length;
  const fromSharp = rows.filter((r) => r.extractionSource === "sharp_exif_tiff").length;

  const okWithCaptionEmptyAltOnly = rows.filter(
    (r) => r.status === "ok" && emptyAltSet.has(r.url),
  ).length;
  const okWithCaptionReplaceableExifAltOnly = rows.filter(
    (r) => r.status === "ok" && replaceableExifAltSet.has(r.url),
  ).length;

  const fieldStatsObj = Object.fromEntries(
    [...fieldStats.entries()].sort((a, b) => b[1] - a[1]),
  );

  const topFields = Object.entries(fieldStatsObj).slice(0, 40);

  const report = {
    generatedAt: new Date().toISOString(),
    options: { limit, concurrency, delayMs },
    totals: {
      uniqueUrlsInMdx: allUrls.length,
      uniqueUrlsEmptyAltOnly: emptyAltUrls.length,
      uniqueUrlsReplaceableExifAlt: replaceableExifAltUrls.length,
      probed: urls.length,
      okWithCaption: ok,
      okWithCaptionEmptyAltOnly,
      okWithCaptionReplaceableExifAltOnly,
      exifButNoFormattedCaption: partial,
      noExifOrEmpty: noExif,
      fetchError: fetchErr,
      parseError: parseErr,
      extractionPathExifrDirect: fromExifr,
      extractionPathSharpExifTiff: fromSharp,
      note:
        "uniqueUrlsReplaceableExifAlt = empty ![](…) or ![*.jpg|*.png|…](…) (filename-like). exif:fill-mdx replaces those when EXIF yields a caption. okWithCaption*EmptyAltOnly / *ReplaceableExifAltOnly are intersections with probed ok rows — often 0 after a successful fill run.",
    },
    fieldFrequency: fieldStatsObj,
    topFields,
    samples: {
      withCaption: rows
        .filter((r) => r.status === "ok" && r.suggestedCaption)
        .slice(0, 15)
        .map((r) => ({
          url: r.url,
          suggestedCaption: r.suggestedCaption,
          extractionSource: r.extractionSource,
        })),
      partialRawKeys: rows
        .filter((r) => r.status === "partial" && r.raw)
        .slice(0, 5)
        .map((r) => ({
          url: r.url,
          keys: Object.keys(r.raw!).slice(0, 30),
        })),
      noExif: rows.filter((r) => r.status === "no_exif").slice(0, 15).map((r) => r.url),
      fetchFailed: rows.filter((r) => r.status === "fetch_error").slice(0, 15),
      parseFailed: rows
        .filter((r) => r.status === "parse_error")
        .slice(0, 20)
        .map((r) => ({ url: r.url, error: r.error })),
    },
    /** Full rows can be large; trim raw to first 5 ok samples for inspection */
    rawSamples: rows
      .filter((r) => r.status === "ok" && r.raw)
      .slice(0, 5)
      .map((r) => ({ url: r.url, suggestedCaption: r.suggestedCaption, raw: r.raw })),
  };

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2), "utf8");

  console.log("\n--- Summary ---");
  console.log(JSON.stringify(report.totals, null, 2));
  console.log("\nTop EXIF keys (when any tags were returned):");
  for (const [k, v] of topFields.slice(0, 25)) {
    console.log(`  ${k}: ${v}`);
  }
  console.log(
    `\nExtraction path: exifr direct=${fromExifr}, via sharp EXIF TIFF=${fromSharp}`,
  );
  console.log(`\nWrote ${REPORT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
