import type { TogstrekImageAsset } from "@/types/togstrek-place-page";

/** Frontmatter for MDX under `content/adventures/*.mdx`. */
export type TogstrekAdventureMdxFrontmatter = {
  title: string;
  description: string;
  /** Canonical slug segment(s); defaults to filename stem when omitted. */
  slug: string;
  published?: string;
  modified?: string;
  lat?: number;
  lng?: number;
  heroImage?: TogstrekImageAsset;
};

function parseHeroImage(raw: unknown): TogstrekImageAsset | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.basename !== "string" ||
    typeof o.src !== "string" ||
    typeof o.width !== "number" ||
    typeof o.height !== "number" ||
    typeof o.alt !== "string"
  ) {
    return undefined;
  }
  return {
    basename: o.basename,
    src: o.src,
    width: o.width,
    height: o.height,
    alt: o.alt,
    caption: typeof o.caption === "string" ? o.caption : undefined,
    credit: typeof o.credit === "string" ? o.credit : undefined,
    priority: o.priority === true,
  };
}

export function parseTogstrekAdventureFrontmatter(
  raw: Record<string, unknown>,
  fileSlug: string,
): TogstrekAdventureMdxFrontmatter {
  const title = raw.title;
  const description = raw.description;
  if (typeof title !== "string" || !title.trim()) {
    throw new Error("Frontmatter: `title` (string) is required");
  }
  if (typeof description !== "string" || !description.trim()) {
    throw new Error("Frontmatter: `description` (string) is required");
  }
  const slugRaw = raw.slug;
  const slug =
    typeof slugRaw === "string" && slugRaw.trim()
      ? slugRaw.trim()
      : fileSlug.trim();
  if (!slug) {
    throw new Error("Frontmatter: `slug` is empty");
  }

  const published =
    typeof raw.published === "string" ? raw.published : undefined;
  const modified = typeof raw.modified === "string" ? raw.modified : undefined;
  const lat = typeof raw.lat === "number" ? raw.lat : undefined;
  const lng = typeof raw.lng === "number" ? raw.lng : undefined;

  return {
    title: title.trim(),
    description: description.trim(),
    slug,
    published,
    modified,
    lat,
    lng,
    heroImage: parseHeroImage(raw.heroImage),
  };
}
