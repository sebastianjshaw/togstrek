import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { extractTogstrekHikingTrailFactsFromMarkdown } from "@/lib/togstrek-hiking-trail-facts";
import {
  parseTogstrekHikingFrontmatter,
  type TogstrekHikingMdxFrontmatter,
} from "@/lib/togstrek-hiking-frontmatter";
import {
  discoverTogstrekHikingGroupSegmentLists,
  isTogstrekHikingGroupRoute,
} from "@/lib/togstrek-hiking-groups";
import {
  areTogstrekSafeUrlPathSegments,
  isTogstrekPathWithinRoot,
  isTogstrekSafeUrlPathSegment,
} from "@/lib/togstrek-path-safety";

const HIKING_ROOT = path.join(process.cwd(), "content", "hiking");

function resolveHikingMdxReadPath(slugSegments: string[]): string | null {
  if (slugSegments.length === 0) {
    const fp = path.join(HIKING_ROOT, "index.mdx");
    return isTogstrekPathWithinRoot(fp, HIKING_ROOT) ? fp : null;
  }
  if (!areTogstrekSafeUrlPathSegments(slugSegments)) return null;
  const folderIndex = path.join(HIKING_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(HIKING_ROOT, ...slugSegments) + ".mdx";
  const fp = fs.existsSync(folderIndex) ? folderIndex : singleFile;
  if (!isTogstrekPathWithinRoot(fp, HIKING_ROOT)) return null;
  return fp;
}

export function mergeTogstrekHikingTrailFactsFromBody(
  fm: TogstrekHikingMdxFrontmatter,
  markdownBody: string,
): TogstrekHikingMdxFrontmatter {
  const ex = extractTogstrekHikingTrailFactsFromMarkdown(markdownBody);
  return {
    ...fm,
    trailDistanceKm: fm.trailDistanceKm ?? ex.distanceKm,
    trailDifficulty: fm.trailDifficulty ?? ex.difficulty,
    trailTransport: fm.trailTransport ?? ex.transport,
  };
}

export type TogstrekHikingResolvedRoute =
  | { kind: "post"; filePath: string }
  | { kind: "group"; groupSegments: string[]; indexPath?: string };

/**
 * Resolves `/hiking/[...slug]` to a single post (`*.mdx`) or a hike group (folder index or virtual group).
 */
export function resolveTogstrekHikingRoute(
  slugSegments: string[],
): TogstrekHikingResolvedRoute | null {
  if (slugSegments.length === 0) return null;
  if (!areTogstrekSafeUrlPathSegments(slugSegments)) return null;

  const singleFile = path.join(HIKING_ROOT, ...slugSegments) + ".mdx";
  const folderIndex = path.join(HIKING_ROOT, ...slugSegments, "index.mdx");

  if (fs.existsSync(singleFile)) {
    if (!isTogstrekPathWithinRoot(singleFile, HIKING_ROOT)) return null;
    return { kind: "post", filePath: singleFile };
  }
  if (fs.existsSync(folderIndex)) {
    if (!isTogstrekPathWithinRoot(folderIndex, HIKING_ROOT)) return null;
    return {
      kind: "group",
      groupSegments: slugSegments,
      indexPath: folderIndex,
    };
  }
  if (isTogstrekHikingGroupRoute(slugSegments)) {
    return { kind: "group", groupSegments: slugSegments };
  }
  return null;
}

/** Path to `content/hiking/index.mdx`, nested `…/index.mdx`, or `…/slug.mdx`. */
export function hikingMdxFilePath(slugSegments: string[]): string {
  const fp = resolveHikingMdxReadPath(slugSegments);
  if (!fp) {
    throw new Error("Invalid hiking path parameters");
  }
  return fp;
}

export function hikingMdxExists(slugSegments: string[]): boolean {
  const fp = resolveHikingMdxReadPath(slugSegments);
  if (!fp) return false;
  try {
    return fs.statSync(fp).isFile();
  } catch {
    return false;
  }
}

export function loadTogstrekHikingFrontmatterOnly(
  slugSegments: string[],
): TogstrekHikingMdxFrontmatter {
  const fp = resolveHikingMdxReadPath(slugSegments);
  if (!fp) {
    throw new Error("Invalid hiking path parameters");
  }
  const raw = fs.readFileSync(fp, "utf8");
  const { data, content } = matter(raw);
  const fm = parseTogstrekHikingFrontmatter(data as Record<string, unknown>);
  return mergeTogstrekHikingTrailFactsFromBody(fm, content);
}

/**
 * Discover nested hiking routes from all `content/hiking` MDX files.
 * Returns `[]` for `index.mdx` (URL `/hiking`), and one array per nested file.
 */
export function discoverTogstrekHikingSlugLists(): string[][] {
  if (!fs.existsSync(HIKING_ROOT)) return [];
  const out: string[][] = [];

  function walk(dir: string, rel: string[]): void {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      if (ent.name.startsWith(".")) continue;
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        if (!isTogstrekSafeUrlPathSegment(ent.name)) continue;
        walk(full, [...rel, ent.name]);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const base = ent.name.replace(/\.mdx$/, "");
        if (base === "index") {
          if (rel.every(isTogstrekSafeUrlPathSegment)) {
            out.push(rel.length === 0 ? [] : rel);
          }
        } else if (isTogstrekSafeUrlPathSegment(base)) {
          if (rel.every(isTogstrekSafeUrlPathSegment)) {
            out.push([...rel, base]);
          }
        }
      }
    }
  }

  walk(HIKING_ROOT, []);

  const indexPath = path.join(HIKING_ROOT, "index.mdx");
  if (fs.existsSync(indexPath)) {
    const hasRootIndex = out.some((s) => s.length === 0);
    if (!hasRootIndex) out.unshift([]);
  }

  return out;
}

/** Params for `/hiking/[...slug]` (at least one segment). */
export function discoverTogstrekHikingSlugParams(): { slug: string[] }[] {
  const map = new Map<string, string[]>();
  const add = (slug: string[]): void => {
    map.set(JSON.stringify(slug), slug);
  };

  for (const s of discoverTogstrekHikingSlugLists()) {
    if (s.length > 0) add(s);
  }
  for (const g of discoverTogstrekHikingGroupSegmentLists()) {
    add(g);
  }

  return [...map.values()].map((slug) => ({ slug }));
}
