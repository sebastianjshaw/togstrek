import { defaultSchema, type Schema } from "hast-util-sanitize";

const HEADING_TAGS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;

function mergeTagAttributeList(tag: string, extra: readonly string[]): string[] {
  const attrs = defaultSchema.attributes;
  const base =
    attrs && typeof attrs === "object" && tag in attrs
      ? attrs[tag as keyof typeof attrs]
      : undefined;
  if (Array.isArray(base)) {
    const merged = base.filter((item): item is string => typeof item === "string");
    for (const name of extra) {
      if (!merged.includes(name)) merged.push(name);
    }
    return merged;
  }
  return [...extra];
}

const defaultClobber = defaultSchema.clobber ?? [];

/**
 * Sanitation schema for MDX-generated HTML (GitHub defaults + `rehype-slug` heading `id`s).
 * MDX JSX components (`PhotoGallery`, `TogstrekJumpTo`, etc.) are not HAST elements and pass through unchanged.
 *
 * `id` is not clobber-prefixed so in-page `#anchors` from jump-to nav match `rehype-slug` output.
 */
export const togstrekMdxSanitizeSchema: Schema = {
  ...defaultSchema,
  clobber: defaultClobber.filter((name) => name !== "id"),
  attributes: {
    ...defaultSchema.attributes,
    ...Object.fromEntries(
      HEADING_TAGS.map((tag) => [
        tag,
        mergeTagAttributeList(tag, ["id"]),
      ]),
    ),
  },
};
