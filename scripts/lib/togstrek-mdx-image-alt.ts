/**
 * Detect markdown image alt text that is a bare filename (migration leftovers),
 * e.g. ends with .jpg — candidates for EXIF caption replacement.
 */

/** Alt text that ends with a common raster image extension (case-insensitive). */
const IMAGE_FILE_EXT_ALT_PATTERN =
  /\.(?:jpe?g|png|gif|webp|tiff?|heic|heif|bmp|avif|jxl)$/i;

export function isFilenameLikeImageAlt(alt: string): boolean {
  const t = alt.trim();
  if (!t) return false;
  return IMAGE_FILE_EXT_ALT_PATTERN.test(t);
}

/** Empty alt or filename-like alt — EXIF fill script replaces these. */
export function shouldReplaceAltWithExif(altRaw: string): boolean {
  const alt = altRaw.trim();
  if (alt === "") return true;
  return isFilenameLikeImageAlt(alt);
}
