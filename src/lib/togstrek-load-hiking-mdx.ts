import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { ReactNode } from "react";
import { getTogstrekPlaceMdxComponents } from "@/components/togstrek-place/togstrek-place-mdx-components";
import { togstrekMdxRemarkPlugins } from "@/lib/togstrek-mdx-remark-plugins";
import { extractTogstrekHikingTrailFactsFromMarkdown } from "@/lib/togstrek-hiking-trail-facts";
import {
  parseTogstrekHikingFrontmatter,
  type TogstrekHikingMdxFrontmatter,
} from "@/lib/togstrek-hiking-frontmatter";
import {
  discoverTogstrekHikingGroupSegmentLists,
  isTogstrekHikingGroupRoute,
} from "@/lib/togstrek-hiking-groups";

const HIKING_ROOT = path.join(process.cwd(), "content", "hiking");

function mergeTogstrekHikingTrailFactsFromBody(
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

export type TogstrekHikingMdxResult = {
  frontmatter: TogstrekHikingMdxFrontmatter;
  content: ReactNode;
};

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

  const singleFile = path.join(HIKING_ROOT, ...slugSegments) + ".mdx";
  const folderIndex = path.join(HIKING_ROOT, ...slugSegments, "index.mdx");

  if (fs.existsSync(singleFile)) {
    return { kind: "post", filePath: singleFile };
  }
  if (fs.existsSync(folderIndex)) {
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
  if (slugSegments.length === 0) {
    return path.join(HIKING_ROOT, "index.mdx");
  }
  const folderIndex = path.join(HIKING_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(HIKING_ROOT, ...slugSegments) + ".mdx";
  if (fs.existsSync(folderIndex)) return folderIndex;
  return singleFile;
}

export function hikingMdxExists(slugSegments: string[]): boolean {
  if (slugSegments.length === 0) {
    try {
      return fs.statSync(path.join(HIKING_ROOT, "index.mdx")).isFile();
    } catch {
      return false;
    }
  }
  const folderIndex = path.join(HIKING_ROOT, ...slugSegments, "index.mdx");
  const singleFile = path.join(HIKING_ROOT, ...slugSegments) + ".mdx";
  try {
    if (fs.statSync(folderIndex).isFile()) return true;
  } catch {
    /* continue */
  }
  try {
    return fs.statSync(singleFile).isFile();
  } catch {
    return false;
  }
}

export function loadTogstrekHikingFrontmatterOnly(
  slugSegments: string[],
): TogstrekHikingMdxFrontmatter {
  const fp = hikingMdxFilePath(slugSegments);
  const raw = fs.readFileSync(fp, "utf8");
  const { data, content } = matter(raw);
  const fm = parseTogstrekHikingFrontmatter(data as Record<string, unknown>);
  return mergeTogstrekHikingTrailFactsFromBody(fm, content);
}

export async function loadTogstrekHikingMdx(
  slugSegments: string[],
): Promise<TogstrekHikingMdxResult> {
  const fp = hikingMdxFilePath(slugSegments);
  const source = fs.readFileSync(fp, "utf8");
  const { data, content: mdBody } = matter(source);
  const baseFm = parseTogstrekHikingFrontmatter(data as Record<string, unknown>);
  const frontmatter = mergeTogstrekHikingTrailFactsFromBody(baseFm, mdBody);

  const { content } = await compileMDX({
    source,
    options: {
      parseFrontmatter: true,
      mdxOptions: {
        remarkPlugins: [...togstrekMdxRemarkPlugins],
      },
    },
    components: getTogstrekPlaceMdxComponents(),
  });

  return { frontmatter, content };
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
        walk(full, [...rel, ent.name]);
      } else if (ent.isFile() && ent.name.endsWith(".mdx")) {
        const base = ent.name.replace(/\.mdx$/, "");
        if (base === "index") {
          out.push(rel.length === 0 ? [] : rel);
        } else {
          out.push([...rel, base]);
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
