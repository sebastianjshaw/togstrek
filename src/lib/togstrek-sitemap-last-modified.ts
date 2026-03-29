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

/** `content/places/<continent>/<country>/<place>.mdx` */
export function togstrekSitemapLastModifiedForPlace(
  continent: string,
  country: string,
  place: string,
): Date | undefined {
  return statMtime(
    path.join(PLACES_ROOT, continent, country, `${place}.mdx`),
  );
}

/** Latest mtime among place MDX files in the country folder (hub page). */
export function togstrekSitemapLastModifiedForCountryHub(
  continent: string,
  country: string,
): Date | undefined {
  const dir = path.join(PLACES_ROOT, continent, country);
  let maxMs = 0;
  try {
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".mdx")) continue;
      const fp = path.join(dir, name);
      try {
        const ms = fs.statSync(fp).mtimeMs;
        if (ms > maxMs) maxMs = ms;
      } catch {
        /* continue */
      }
    }
  } catch {
    return undefined;
  }
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
