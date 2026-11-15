import { parseTogstrekHeroImage } from "@/lib/togstrek-frontmatter-hero-image";
import type { TogstrekImageAsset } from "@/types/togstrek-place-page";

/** Frontmatter for MDX under `content/photography/**` (posts, collection and hub pages). */
export type TogstrekPhotographyMdxFrontmatter = {
  title: string;
  description: string;
  published?: string;
  modified?: string;
  lat?: number;
  lng?: number;
  heroImage?: TogstrekImageAsset;
  /**
   * Collections (Art Nude, Events, …) a post is listed under on the Other Work
   * pages. When absent, a post sits in the collection named by its folder.
   */
  collections?: string[];
  /** Optional pull quote below the title on the hub hero (landing variant). */
  heroQuote?: string;
  heroQuoteAttribution?: string;
};

/**
 * `gray-matter` (js-yaml) turns an unquoted `2009-01-31` / `2009-01-31T00:00:00.000Z`
 * into a `Date`, while the MDX compiler hands back the raw string. Accept both.
 */
function yamlDateToString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  return undefined;
}

export function parseTogstrekPhotographyFrontmatter(
  raw: Record<string, unknown>,
): TogstrekPhotographyMdxFrontmatter {
  const title = raw.title;
  const description = raw.description;
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Frontmatter: `title` (string) is required");
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Frontmatter: `description` (string) is required");
  }
  const published = yamlDateToString(raw.published);
  const modified = yamlDateToString(raw.modified);
  const lat = typeof raw.lat === "number" ? raw.lat : undefined;
  const lng = typeof raw.lng === "number" ? raw.lng : undefined;
  const heroQuote =
    typeof raw.heroQuote === "string" ? raw.heroQuote.trim() : undefined;
  const heroQuoteAttribution =
    typeof raw.heroQuoteAttribution === "string"
      ? raw.heroQuoteAttribution.trim()
      : undefined;

  const collections = Array.isArray(raw.collections)
    ? raw.collections.filter(
        (c): c is string => typeof c === "string" && c.trim() !== "",
      )
    : undefined;

  return {
    title: title.trim(),
    description: description.trim(),
    published,
    modified,
    lat,
    lng,
    heroImage: parseTogstrekHeroImage(
      raw.heroImage,
      `photography "${String(raw.title ?? "untitled")}"`,
    ),
    collections: collections?.length ? collections : undefined,
    heroQuote: heroQuote || undefined,
    heroQuoteAttribution: heroQuoteAttribution || undefined,
  };
}
