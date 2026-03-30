import fs from "node:fs";
import path from "node:path";

import {
  discoverTogstrekPlaceSlugs,
  togstrekPlaceMdxExists,
  type TogstrekPlaceSlugParams,
} from "@/lib/togstrek-place-mdx-fs";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

export function englandHubDirPath(): string {
  return path.join(PLACES_ROOT, "europe", "united-kingdom", "england");
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

export function discoverEnglandCountyDirectorySlugs(): string[] {
  const root = englandHubDirPath();
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
 * `/europe/united-kingdom/england/{county}` when `england/{county}/` is a directory
 * with MDX, and there is no leaf `england/{county}.mdx`.
 */
export function isEnglandCountyHubRoute(
  continent: string,
  country: string,
  place: string[],
): boolean {
  if (continent !== "europe" || country !== "united-kingdom") return false;
  if (place.length !== 2 || place[0] !== "england") return false;
  if (togstrekPlaceMdxExists(continent, country, place)) return false;
  const county = place[1]!;
  const countyDir = path.join(englandHubDirPath(), county);
  try {
    if (!fs.statSync(countyDir).isDirectory()) return false;
  } catch {
    return false;
  }
  return directoryContainsMdx(countyDir);
}

export function listPlaceSlugsForEnglandCounty(
  county: string,
): { place: string[] }[] {
  return discoverTogstrekPlaceSlugs()
    .filter(
      (s) =>
        s.continent === "europe" &&
        s.country === "united-kingdom" &&
        s.place.length >= 2 &&
        s.place[0] === "england" &&
        s.place[1] === county,
    )
    .map((s) => ({ place: s.place }))
    .sort((a, b) =>
      a.place.join("/").localeCompare(b.place.join("/"), undefined, {
        sensitivity: "base",
      }),
    );
}

export function discoverEnglandCountyHubParams(): TogstrekPlaceSlugParams[] {
  return discoverEnglandCountyDirectorySlugs()
    .filter(
      (county) =>
        !togstrekPlaceMdxExists("europe", "united-kingdom", [
          "england",
          county,
        ]),
    )
    .map((county) => ({
      continent: "europe",
      country: "united-kingdom",
      place: ["england", county],
    }));
}

export function countPlacesInEnglandCounty(county: string): number {
  return listPlaceSlugsForEnglandCounty(county).length;
}
