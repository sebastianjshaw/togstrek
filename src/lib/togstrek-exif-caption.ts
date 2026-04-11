/**
 * Pure EXIF → camera caption line (no sharp/exifr). Used by MDX tooling scripts
 * and unit tests.
 */

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

  const makeStr = typeof make === "string" ? make.trim() : "";
  const modelStr = typeof model === "string" ? model.trim() : "";

  const head: string[] = [];
  if (modelStr) {
    const modelLower = modelStr.toLowerCase();
    const makeLower = makeStr.toLowerCase();
    if (
      makeStr &&
      (modelLower === makeLower ||
        modelLower.startsWith(`${makeLower} `) ||
        modelLower.startsWith(`${makeLower}-`))
    ) {
      head.push(modelStr);
    } else {
      if (makeStr) head.push(makeStr);
      head.push(modelStr);
    }
  } else if (makeStr) {
    head.push(makeStr);
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
