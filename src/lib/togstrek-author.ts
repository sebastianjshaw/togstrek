import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

export const TOGSTREK_AUTHOR_NAME = "Sebastian Shaw";

/** Stable fragment for `Person` JSON-LD — cite this `@id` from `Article.author`. */
export function getTogstrekAuthorPersonId(): string {
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  return `${origin}/about#person`;
}

/**
 * Public profile URLs for `sameAs` (comma- or newline-separated).
 * Example: `https://instagram.com/you,https://www.flickr.com/photos/you`
 */
export function getTogstrekAuthorSameAs(): string[] {
  const raw = process.env.NEXT_PUBLIC_AUTHOR_SAMEAS?.trim();
  if (!raw) return [];
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function getTogstrekAboutPathAbsolute(): string {
  const origin = getTogstrekSiteOrigin().replace(/\/+$/, "");
  return `${origin}/about`;
}
