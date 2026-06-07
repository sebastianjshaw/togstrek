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

/** MDX layout components that appear as HAST element names before JSX compile. */
const TOGSTREK_MDX_COMPONENT_TAG_NAMES = [
  "PhotoGallery",
  "TogstrekJumpTo",
  "TogstrekAdventureFeaturedSection",
  "TogstrekAdventureFeaturedPlace",
  "TogstrekOtherWorkHubBody",
  "TogstrekOtherWorkSectionFeatured",
] as const;

const TOGSTREK_MDX_COMPONENT_ATTRIBUTES = [
  "title",
  "href",
  "date",
  "dateTime",
  "imageSrc",
  "imageAlt",
  "excerpt",
  "layout",
  "payload",
  "section",
] as const;

/**
 * Sanitation schema for MDX-generated HTML (GitHub defaults + `rehype-slug` heading `id`s).
 * Also allowlists project MDX layout tags and `div`/`className` for direct HAST sanitization.
 * Adventure, other-work, place, and hiking MDX skip `rehype-sanitize` in their loaders because
 * the plugin still drops JSX layout nodes in the compile pipeline despite this schema.
 *
 * `id` is not clobber-prefixed so in-page `#anchors` from jump-to nav match `rehype-slug` output.
 */
export const togstrekMdxSanitizeSchema: Schema = {
  ...defaultSchema,
  tagNames: [
    ...(defaultSchema.tagNames ?? []),
    ...TOGSTREK_MDX_COMPONENT_TAG_NAMES,
  ],
  clobber: defaultClobber.filter((name) => name !== "id"),
  attributes: {
    ...defaultSchema.attributes,
    div: mergeTagAttributeList("div", ["className", "class"]),
    ...Object.fromEntries(
      HEADING_TAGS.map((tag) => [
        tag,
        mergeTagAttributeList(tag, ["id"]),
      ]),
    ),
    ...Object.fromEntries(
      TOGSTREK_MDX_COMPONENT_TAG_NAMES.map((tag) => [
        tag,
        [...TOGSTREK_MDX_COMPONENT_ATTRIBUTES],
      ]),
    ),
  },
};
