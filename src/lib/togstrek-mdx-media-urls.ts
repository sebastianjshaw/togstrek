import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";

const MEDIA_IMAGE_EXT = /\.(?:jpe?g|png|webp|gif)/i;

/**
 * Scan from each CDN origin through the first image extension. Handles paths with
 * parentheses (e.g. `Beach-001+(2019-04-25T18_27_49.843).jpg`) and ignores prose
 * placeholders like `overview/…` that lack an extension.
 */
export function extractTogstrekMdxMediaUrls(fileText: string): string[] {
  const base = getTogstrekMediaBaseUrl();
  const found = new Set<string>();
  let index = 0;

  while ((index = fileText.indexOf(base, index)) !== -1) {
    const slice = fileText.slice(index);
    MEDIA_IMAGE_EXT.lastIndex = 0;
    const extMatch = MEDIA_IMAGE_EXT.exec(slice);
    if (extMatch) {
      const raw = slice
        .slice(0, extMatch.index + extMatch[0].length)
        .replace(/[),.;]+$/, "");
      if (raw.startsWith("http")) found.add(raw);
    }
    index += base.length;
  }

  return [...found].sort();
}

/** HEAD/GET checks should use the literal MDX string (not `URL#href` re-encoding). */
export function isTogstrekMdxMediaUrlWellFormed(url: string): boolean {
  return MEDIA_IMAGE_EXT.test(url);
}
