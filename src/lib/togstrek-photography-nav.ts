import {
  discoverTogstrekPhotographySlugLists,
  loadTogstrekPhotographyFrontmatterOnly,
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

/** Category a top-level folder belongs to (folds legacy duplicates). */
export function canonicalTogstrekPhotographyCategory(folder: string): string {
  return FOLDER_TO_CATEGORY[folder] ?? folder;
}

let categoryPostsCache: Map<string, string[][]> | undefined;

/**
 * Every Other Work collection with the posts that belong to it. A post lists
 * its collections in `collections` frontmatter; without it, a post sits in the
 * collection named by its folder.
 */
function categoryPosts(): Map<string, string[][]> {
  if (categoryPostsCache && process.env.NODE_ENV === "production") {
    return categoryPostsCache;
  }

  const byCategory = new Map<string, string[][]>();
  for (const segments of discoverTogstrekPhotographySlugLists()) {
    const { collections } = loadTogstrekPhotographyFrontmatterOnly(segments);
    const categories =
      collections ??
      (segments.length >= 2
        ? [canonicalTogstrekPhotographyCategory(segments[0]!)]
        : []);
    for (const category of categories) {
      if (!isTogstrekSafeUrlPathSegment(category)) continue;
      const posts = byCategory.get(category) ?? [];
      posts.push(segments);
      byCategory.set(category, posts);
    }
  }
  for (const posts of byCategory.values()) {
    posts.sort((a, b) => a.join("/").localeCompare(b.join("/")));
  }

  categoryPostsCache = byCategory;
  return byCategory;
}

/** Other Work collections, in alphabetical order. */
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
    { href: "/photography", label: "Other Work" },
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
