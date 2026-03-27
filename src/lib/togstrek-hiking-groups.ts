import fs from "node:fs";
import path from "node:path";

const HIKING_ROOT = path.join(process.cwd(), "content", "hiking");

/**
 * A “hike” hub is a folder that directly contains at least one `*.mdx` post
 * (not `index.mdx`). If a folder only has subfolders with posts (e.g. `nepal/annapurna/`),
 * we recurse until we find that leaf folder.
 *
 * Root-level `*.mdx` files (e.g. `surtesjon.mdx`) are not groups — they are single posts.
 */
export function discoverTogstrekHikingGroupSegmentLists(): string[][] {
  if (!fs.existsSync(HIKING_ROOT)) return [];
  const groups: string[][] = [];

  function walkDir(absPath: string, rel: string[]): void {
    const entries = fs.readdirSync(absPath, { withFileTypes: true });
    const directMdx = entries.filter(
      (e) =>
        e.isFile() &&
        e.name.endsWith(".mdx") &&
        e.name !== "index.mdx",
    );
    const subdirs = entries.filter(
      (e) => e.isDirectory() && !e.name.startsWith("."),
    );

    if (rel.length === 0) {
      for (const d of subdirs) {
        walkDir(path.join(absPath, d.name), [d.name]);
      }
      return;
    }

    if (directMdx.length > 0) {
      groups.push(rel);
      return;
    }

    for (const d of subdirs) {
      walkDir(path.join(absPath, d.name), [...rel, d.name]);
    }
  }

  walkDir(HIKING_ROOT, []);
  return groups;
}

export function slugSegmentsEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}

export function isTogstrekHikingGroupRoute(slug: string[]): boolean {
  return discoverTogstrekHikingGroupSegmentLists().some((g) =>
    slugSegmentsEqual(g, slug),
  );
}
