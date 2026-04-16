import fs from "node:fs";
import path from "node:path";

import {
  discoverTogstrekPlaceSlugs,
  togstrekPlaceMdxExists,
  type TogstrekPlaceSlugParams,
} from "@/lib/togstrek-place-mdx-fs";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

export const TOGSTREK_SWEDEN_CONTINENT = "europe" as const;
export const TOGSTREK_SWEDEN_COUNTRY = "sweden" as const;

export function swedenCountryHubDirPath(): string {
  return path.join(
    PLACES_ROOT,
    TOGSTREK_SWEDEN_CONTINENT,
    TOGSTREK_SWEDEN_COUNTRY,
  );
}

function directoryContainsMdx(dir: string): boolean {
  let found = false;
  function walk(d: string) {
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const full = path.join(d, e.name);
      if (e.isDirectory()) walk(full);
      else if (e.isFile() && e.name.toLowerCase().endsWith(".mdx")) {
        found = true;
      }
    }
  }
  walk(dir);
  return found;
}

/**
 * Top-level directories under `sweden/` that contain at least one `.mdx`
 * somewhere beneath (typically `lan/place.mdx`).
 */
export function discoverSwedenLanDirectorySlugs(): string[] {
  const root = swedenCountryHubDirPath();
  if (!fs.existsSync(root)) return [];
  const out: string[] = [];
  for (const name of fs.readdirSync(root)) {
    const full = path.join(root, name);
    try {
      if (!fs.statSync(full).isDirectory()) continue;
    } catch {
      continue;
    }
    if (directoryContainsMdx(full)) out.push(name);
  }
  return out.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: "base" }));
}

/**
 * `/europe/sweden/{lan}` when `{lan}/` is a directory with nested MDX and there is
 * no leaf `{lan}.mdx` at the country root (same pattern as US state hubs).
 */
export function isSwedenLanHubRoute(
  continent: string,
  country: string,
  place: string[],
): boolean {
  if (continent !== TOGSTREK_SWEDEN_CONTINENT || country !== TOGSTREK_SWEDEN_COUNTRY) {
    return false;
  }
  if (place.length !== 1) return false;
  if (togstrekPlaceMdxExists(continent, country, place)) return false;
  const lan = place[0]!;
  const lanDir = path.join(swedenCountryHubDirPath(), lan);
  try {
    if (!fs.statSync(lanDir).isDirectory()) return false;
  } catch {
    return false;
  }
  return directoryContainsMdx(lanDir);
}

export function listPlaceSlugsForSwedenLan(lanSlug: string): { place: string[] }[] {
  return discoverTogstrekPlaceSlugs()
    .filter(
      (s) =>
        s.continent === TOGSTREK_SWEDEN_CONTINENT &&
        s.country === TOGSTREK_SWEDEN_COUNTRY &&
        s.place.length >= 2 &&
        s.place[0] === lanSlug,
    )
    .map((s) => ({ place: s.place }))
    .sort((a, b) =>
      a.place.join("/").localeCompare(b.place.join("/"), undefined, {
        sensitivity: "base",
      }),
    );
}

export function discoverSwedenLanHubParams(): TogstrekPlaceSlugParams[] {
  return discoverSwedenLanDirectorySlugs()
    .filter(
      (lan) =>
        !togstrekPlaceMdxExists(
          TOGSTREK_SWEDEN_CONTINENT,
          TOGSTREK_SWEDEN_COUNTRY,
          [lan],
        ),
    )
    .map((lan) => ({
      continent: TOGSTREK_SWEDEN_CONTINENT,
      country: TOGSTREK_SWEDEN_COUNTRY,
      place: [lan],
    }));
}

export function countPlacesInSwedenLan(lanSlug: string): number {
  return listPlaceSlugsForSwedenLan(lanSlug).length;
}
