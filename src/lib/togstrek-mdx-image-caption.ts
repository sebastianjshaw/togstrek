/**
 * Heuristic: markdown alt text that is primarily camera / exposure metadata
 * (e.g. "Canon EOS R5 EF17-40mm …, 17mm, f11, 1/200, ISO100").
 */
export function isLikelyCameraExifCaption(text: string): boolean {
  const t = text.trim();
  if (t.length < 14) return false;

  const hasBrandOrBody =
    /\b(Canon|Nikon|Sony|OLYMPUS|Olympus|Panasonic|Fujifilm|Leica|Sigma|Tamron|Ricoh|Pentax|Hasselblad|GoPro|DJI|EOS|ILCE|DSC|Z\s*6|Z\s*7|α|Alpha)\b/i.test(
      t,
    );
  const hasFocal = /\b\d{1,3}(?:\.\d)?mm\b/i.test(t);
  const hasAperture = /(?:^|[,\s])f(?:\d+(?:\.\d+)?)(?:\s|,|$)/i.test(t);
  const hasIso = /\bISO\s*\d{2,5}\b/i.test(t);
  const hasShutter = /\b\d+\s*\/\s*\d+\b/.test(t) || /\b1\s*\/\s*\d+\b/.test(t);

  const signals = [
    hasBrandOrBody,
    hasFocal,
    hasAperture,
    hasIso,
    hasShutter,
  ].filter(Boolean).length;

  return signals >= 2 || (hasBrandOrBody && (hasFocal || hasAperture));
}

/**
 * True when alt is a bare migration/CDN hash filename (e.g. `2bfea8545e9808f1.jpg`).
 * Those files often have no camera EXIF on the CDN; the string is not a human caption.
 */
export function isLikelyOpaqueIdFilenameAlt(text: string): boolean {
  const t = text.trim();
  const m = t.match(/^(.+)\.(jpe?g|png|gif|webp|tiff?|jxl)$/i);
  if (!m) return false;
  const stem = m[1] ?? "";
  if (/\s/.test(stem)) return false;
  return /^[a-f0-9][a-f0-9.-]{6,}$/i.test(stem);
}

/** Alt text that ends with a common raster extension (case-insensitive). */
const IMAGE_FILE_EXT_ALT_PATTERN =
  /\.(?:jpe?g|png|gif|webp|tiff?|heic|heif|bmp|avif|jxl)$/i;

/**
 * True when alt looks like a source filename (e.g. `20240814-… - TogsTrek - 003A4043.jpg`).
 * Same rule as {@link shouldReplaceAltWithExif} for the EXIF fill script.
 */
export function isFilenameLikeImageAlt(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  return IMAGE_FILE_EXT_ALT_PATTERN.test(t);
}

/** Empty alt or filename-like alt — candidates for EXIF replacement in MDX tooling. */
export function shouldReplaceAltWithExif(altRaw: string): boolean {
  const alt = altRaw.trim();
  if (alt === "") return true;
  return isFilenameLikeImageAlt(alt);
}

/**
 * Filename-style or opaque-id alt that is not already a camera EXIF line — do not show as
 * visible caption; use `scripts/togstrek-fill-mdx-empty-image-exif.ts` to swap alt for EXIF.
 */
export function isTechnicalImageFilenameAlt(text: string): boolean {
  const t = text.trim();
  if (!t) return false;
  if (isLikelyCameraExifCaption(t)) return false;
  return isLikelyOpaqueIdFilenameAlt(t) || isFilenameLikeImageAlt(t);
}
