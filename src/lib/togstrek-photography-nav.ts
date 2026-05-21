import fs from "node:fs";
import path from "node:path";

import {
  discoverTogstrekPhotographySlugLists,
  photographyMdxExists,
} from "@/lib/togstrek-load-photography-mdx";
import {
  isTogstrekPathWithinRoot,
  isTogstrekSafeUrlPathSegment,
} from "@/lib/togstrek-path-safety";

const PHOTOGRAPHY_ROOT = path.join(process.cwd(), "content", "photography");

export type TogstrekBreadcrumbItem = { href?: string; label: string };

function formatPhotographySectionLabel(segment: string): string {
  return segment
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

/** Top-level folders under `content/photography/` that contain at least one post. */
export function discoverTogstrekPhotographyCategorySlugs(): string[] {
  const categories = new Set<string>();
  for (const segments of discoverTogstrekPhotographySlugLists()) {
    if (segments.length >= 2 && isTogstrekSafeUrlPathSegment(segments[0]!)) {
      categories.add(segments[0]!);
    }
  }
  return [...categories].sort((a, b) => a.localeCompare(b));
}

/** `true` when `/{category}` is a section hub, not a single-segment article. */
export function isTogstrekPhotographyCategorySlug(category: string): boolean {
  if (!isTogstrekSafeUrlPathSegment(category)) return false;
  const dir = path.join(PHOTOGRAPHY_ROOT, category);
  if (!fs.existsSync(dir)) return false;
  try {
    if (!fs.statSync(dir).isDirectory()) return false;
  } catch {
    return false;
  }
  if (!isTogstrekPathWithinRoot(dir, PHOTOGRAPHY_ROOT)) return false;
  if (photographyMdxExists([category])) return false;
  return discoverTogstrekPhotographyCategorySlugs().includes(category);
}

export function listTogstrekPhotographySlugListsInCategory(
  category: string,
): string[][] {
  if (!isTogstrekPhotographyCategorySlug(category)) return [];
  return discoverTogstrekPhotographySlugLists()
    .filter((segments) => segments[0] === category)
    .sort((a, b) => a.join("/").localeCompare(b.join("/")));
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
    const section = slugSegments[0]!;
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
