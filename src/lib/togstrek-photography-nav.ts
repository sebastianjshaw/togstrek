import { TOGSTREK_OTHER_WORK_SECTION_FEATURED } from "@/data/togstrek-other-work-section-featured";
import {
  discoverTogstrekPhotographySlugLists,
  photographyMdxExists,
} from "@/lib/togstrek-load-photography-mdx";
import { isTogstrekSafeUrlPathSegment } from "@/lib/togstrek-path-safety";

export type TogstrekBreadcrumbItem = { href?: string; label: string };

function formatPhotographySectionLabel(segment: string): string {
  return segment
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/**
 * Two legacy folders hold a single post each next to the real collection
 * (`event/` beside `events/`, `model/` beside `models/`); they belong to it.
 */
const FOLDER_TO_CATEGORY: Record<string, string> = {
  event: "events",
  model: "models",
};

/**
 * “Other work” section keys that differ from the photography folder name for
 * the same collection.
 */
const OTHER_WORK_SECTION_TO_CATEGORY: Record<string, string> = {
  "photography-guides": "guides",
  "street-photography": "street",
};

/** Category a top-level folder belongs to (folds legacy duplicates). */
export function canonicalTogstrekPhotographyCategory(folder: string): string {
  return FOLDER_TO_CATEGORY[folder] ?? folder;
}

let categoryPostsCache: Map<string, string[][]> | undefined;

/**
 * Every collection with the posts that belong to it. A post is in the
 * collection of its folder and in each collection the Other work sections list
 * it under, so posts that sit at the root or in another folder (e.g. Acrobatic
 * Art Nudes under Art Nude) still show up when filtering.
 */
function categoryPosts(): Map<string, string[][]> {
  if (categoryPostsCache && process.env.NODE_ENV === "production") {
    return categoryPostsCache;
  }

  const byCategory = new Map<string, Map<string, string[]>>();
  const add = (category: string, segments: string[]): void => {
    if (!isTogstrekSafeUrlPathSegment(category)) return;
    let posts = byCategory.get(category);
    if (!posts) {
      posts = new Map();
      byCategory.set(category, posts);
    }
    posts.set(segments.join("/"), segments);
  };

  for (const segments of discoverTogstrekPhotographySlugLists()) {
    if (segments.length >= 2) {
      add(canonicalTogstrekPhotographyCategory(segments[0]!), segments);
    }
  }

  const prefix = "/photography/";
  for (const [section, rows] of Object.entries(
    TOGSTREK_OTHER_WORK_SECTION_FEATURED,
  )) {
    const category = OTHER_WORK_SECTION_TO_CATEGORY[section] ?? section;
    for (const row of rows) {
      if (!row.href.startsWith(prefix)) continue;
      const segments = row.href.slice(prefix.length).split("/").filter(Boolean);
      if (
        segments.length > 0 &&
        segments.every(isTogstrekSafeUrlPathSegment) &&
        photographyMdxExists(segments)
      ) {
        add(category, segments);
      }
    }
  }

  categoryPostsCache = new Map(
    [...byCategory].map(([category, posts]) => [
      category,
      [...posts.values()].sort((a, b) => a.join("/").localeCompare(b.join("/"))),
    ]),
  );
  return categoryPostsCache;
}

/** Collections shown as filters on `/photography`, in alphabetical order. */
export function discoverTogstrekPhotographyCategorySlugs(): string[] {
  return [...categoryPosts().keys()].sort((a, b) => a.localeCompare(b));
}

/** `true` when `/{category}` is a collection hub, not a single-segment article. */
export function isTogstrekPhotographyCategorySlug(category: string): boolean {
  if (!isTogstrekSafeUrlPathSegment(category)) return false;
  if (photographyMdxExists([category])) return false;
  return categoryPosts().has(category);
}

export function listTogstrekPhotographySlugListsInCategory(
  category: string,
): string[][] {
  if (!isTogstrekPhotographyCategorySlug(category)) return [];
  return categoryPosts().get(category) ?? [];
}

/** Breadcrumbs for `/photography` article and category pages. */
export function buildTogstrekPhotographyBreadcrumbItems(
  slugSegments: string[],
  currentTitle: string,
): TogstrekBreadcrumbItem[] {
  const items: TogstrekBreadcrumbItem[] = [
    { href: "/photography", label: "Photography" },
  ];

  if (slugSegments.length >= 2) {
    const section = canonicalTogstrekPhotographyCategory(slugSegments[0]!);
    const sectionItem: TogstrekBreadcrumbItem = {
      label: formatPhotographySectionLabel(section),
    };
    if (isTogstrekPhotographyCategorySlug(section)) {
      sectionItem.href = `/photography/${section}`;
    }
    items.push(sectionItem);
  }

  items.push({ label: currentTitle });
  return items;
}
