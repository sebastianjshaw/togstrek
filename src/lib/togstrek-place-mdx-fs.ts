import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import {
  parseTogstrekPlaceFrontmatter,
  type TogstrekPlaceMdxFrontmatter,
} from "@/lib/togstrek-place-frontmatter";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import {
  areTogstrekCountryHubRouteParamsSafe,
  areTogstrekPlaceRouteParamsSafe,
  isTogstrekPathWithinRoot,
  isTogstrekSafeUrlPathSegment,
} from "@/lib/togstrek-path-safety";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

function resolveTogstrekPlaceMdxFilePath(
  continent: string,
  country: string,
  placeSegments: string[],
): string | null {
  if (!areTogstrekPlaceRouteParamsSafe(continent, country, placeSegments)) {
    return null;
  }
  const fp =
    path.join(PLACES_ROOT, continent, country, ...placeSegments) + ".mdx";
  if (!isTogstrekPathWithinRoot(fp, PLACES_ROOT)) return null;
  return fp;
}

export type TogstrekPlaceSlugParams = {
  continent: string;
  country: string;
  /**
   * Segments after `/{continent}/{country}/`: optional admin tier + leaf place.
   * Admin tier = state | county | district | län (same level); e.g. `['copenhagen']` or `['california','los-angeles']`.
   */
  place: string[];
};

/**
 * Resolved MDX path, or throws if route parameters are not safe URL segments.
 * (Prevents path traversal when `continent` / `country` / `place` come from the request.)
 */
export function togstrekPlaceMdxFilePath(
  continent: string,
  country: string,
  placeSegments: string[],
): string {
  const fp = resolveTogstrekPlaceMdxFilePath(continent, country, placeSegments);
  if (!fp) {
    throw new Error("Invalid place MDX path parameters");
  }
  return fp;
}

export function togstrekPlaceMdxExists(
  continent: string,
  country: string,
  placeSegments: string[],
): boolean {
  const fp = resolveTogstrekPlaceMdxFilePath(continent, country, placeSegments);
  if (!fp) return false;
  try {
    return fs.statSync(fp).isFile();
  } catch {
    return false;
  }
}

/** Fast path for `generateMetadata` — YAML only, no MDX compile */
export function loadTogstrekPlaceFrontmatterOnly(
  continent: string,
  country: string,
  placeSegments: string[],
): TogstrekPlaceMdxFrontmatter {
  const fp = resolveTogstrekPlaceMdxFilePath(continent, country, placeSegments);
  if (!fp) {
    throw new Error("Invalid place MDX path parameters");
  }
  const raw = fs.readFileSync(fp, "utf8");
  const { data } = matter(raw);
  return parseTogstrekPlaceFrontmatter(data as Record<string, unknown>, {
    continent,
    country,
    placePath: togstrekPlacePathFromSegments(placeSegments),
  });
}

function collectMdxFilesUnderCountryDir(
  countryDir: string,
  continent: string,
  country: string,
  out: TogstrekPlaceSlugParams[],
): void {
  function walk(currentDir: string): void {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const ent of entries) {
      const full = path.join(currentDir, ent.name);
      if (ent.isDirectory()) {
        walk(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".mdx")) {
        const rel = path.relative(countryDir, full).replace(/\\/g, "/");
        const withoutExt = rel.replace(/\.mdx$/i, "");
        const segments = withoutExt.split("/").filter(Boolean);
        if (segments.length === 0) continue;
        if (!segments.every(isTogstrekSafeUrlPathSegment)) continue;
        out.push({ continent, country, place: segments });
      }
    }
  }
  walk(countryDir);
}

/**
 * In-memory scan cache — `listTogstrekPlaceSlugsForCountry` used to call `discoverTogstrekPlaceSlugs`
 * on every country row (hundreds of full-tree walks per hub). Restart the dev server after adding
 * new place MDX so this cache refreshes.
 */
let discoverTogstrekPlaceSlugsCache: TogstrekPlaceSlugParams[] | undefined;

/** Discover all place MDX files under `content/places/<continent>/<country>/` (any nesting depth). */
export function discoverTogstrekPlaceSlugs(): TogstrekPlaceSlugParams[] {
  if (discoverTogstrekPlaceSlugsCache) return discoverTogstrekPlaceSlugsCache;
  if (!fs.existsSync(PLACES_ROOT)) {
    discoverTogstrekPlaceSlugsCache = [];
    return discoverTogstrekPlaceSlugsCache;
  }
  const out: TogstrekPlaceSlugParams[] = [];
  for (const continent of fs.readdirSync(PLACES_ROOT)) {
    if (!isTogstrekSafeUrlPathSegment(continent)) continue;
    const cDir = path.join(PLACES_ROOT, continent);
    if (!fs.statSync(cDir).isDirectory()) continue;
    for (const country of fs.readdirSync(cDir)) {
      if (!isTogstrekSafeUrlPathSegment(country)) continue;
      const coDir = path.join(cDir, country);
      if (!fs.statSync(coDir).isDirectory()) continue;
      collectMdxFilesUnderCountryDir(coDir, continent, country, out);
    }
  }
  discoverTogstrekPlaceSlugsCache = out;
  return out;
}

/** Distinct `/{continent}/{country}` pairs that have at least one place MDX file. */
export function discoverTogstrekCountryHubParams(): {
  continent: string;
  country: string;
}[] {
  const slugs = discoverTogstrekPlaceSlugs();
  const seen = new Set<string>();
  const result: { continent: string; country: string }[] = [];
  for (const s of slugs) {
    const key = `${s.continent}\0${s.country}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ continent: s.continent, country: s.country });
  }
  return result;
}

/** All place slug lists under `content/places/<continent>/<country>/`, sorted by joined path. */
export function listTogstrekPlaceSlugsForCountry(
  continent: string,
  country: string,
): { place: string[] }[] {
  if (!areTogstrekCountryHubRouteParamsSafe(continent, country)) {
    return [];
  }
  return discoverTogstrekPlaceSlugs()
    .filter((s) => s.continent === continent && s.country === country)
    .map((s) => ({ place: s.place }))
    .sort((a, b) =>
      a.place.join("/").localeCompare(b.place.join("/"), undefined, {
        sensitivity: "base",
      }),
    );
}

/**
 * One level deeper than `parentSegments` only — e.g. `['svalbard']` yields
 * `['svalbard','longyearbyen']` but not `['svalbard','x','y']`. Used for
 * regional hub place pages that list child destinations in the template (same
 * card pattern as country hubs).
 */
export function listTogstrekDirectChildPlaceSlugsForParent(
  continent: string,
  country: string,
  parentSegments: string[],
): { place: string[] }[] {
  if (!areTogstrekCountryHubRouteParamsSafe(continent, country)) {
    return [];
  }
  if (!areTogstrekPlaceRouteParamsSafe(continent, country, parentSegments)) {
    return [];
  }
  const wantLen = parentSegments.length + 1;
  return listTogstrekPlaceSlugsForCountry(continent, country).filter(
    ({ place }) => {
      if (place.length !== wantLen) return false;
      for (let i = 0; i < parentSegments.length; i++) {
        if (place[i] !== parentSegments[i]) return false;
      }
      return true;
    },
  );
}
