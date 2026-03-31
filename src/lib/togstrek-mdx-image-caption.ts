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
