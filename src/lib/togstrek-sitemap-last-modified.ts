import fs from "node:fs";
import path from "node:path";

import { hikingMdxFilePath } from "@/lib/togstrek-hiking-content-fs";
import { otherWorkMdxFilePath } from "@/lib/togstrek-load-other-work-mdx";
import { photographyMdxFilePath } from "@/lib/togstrek-load-photography-mdx";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

function statMtime(filePath: string): Date | undefined {
  try {
    return fs.statSync(filePath).mtime;
  } catch {
    return undefined;
  }
}

/** `content/places/<continent>/<country>/…/<place>.mdx` (nested place path allowed). */
export function togstrekSitemapLastModifiedForPlace(
  continent: string,
  country: string,
  placeSegments: string[],
): Date | undefined {
  return statMtime(
    path.join(PLACES_ROOT, continent, country, ...placeSegments) + ".mdx",
  );
}

function maxMtimeMdxUnderDir(dir: string): number {
  let maxMs = 0;
  function walk(current: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(current, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".mdx")) {
        try {
          const ms = fs.statSync(full).mtimeMs;
          if (ms > maxMs) maxMs = ms;
        } catch {
          /* continue */
        }
      }
    }
  }
  walk(dir);
  return maxMs;
}

/** Latest mtime among place MDX files under the country folder (hub page), any depth. */
export function togstrekSitemapLastModifiedForCountryHub(
  continent: string,
  country: string,
): Date | undefined {
  const dir = path.join(PLACES_ROOT, continent, country);
  const maxMs = maxMtimeMdxUnderDir(dir);
  return maxMs > 0 ? new Date(maxMs) : undefined;
}

export function togstrekSitemapLastModifiedForHiking(
  slugSegments: string[],
): Date | undefined {
  return statMtime(hikingMdxFilePath(slugSegments));
}

export function togstrekSitemapLastModifiedForOtherWork(
  slugSegments: string[],
): Date | undefined {
  return statMtime(otherWorkMdxFilePath(slugSegments));
}

export function togstrekSitemapLastModifiedForPhotography(
  slugSegments: string[],
): Date | undefined {
  return statMtime(photographyMdxFilePath(slugSegments));
}
