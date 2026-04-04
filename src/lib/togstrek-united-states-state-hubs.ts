import fs from "node:fs";
import path from "node:path";

import {
  discoverTogstrekPlaceSlugs,
  togstrekPlaceMdxExists,
  type TogstrekPlaceSlugParams,
} from "@/lib/togstrek-place-mdx-fs";

const PLACES_ROOT = path.join(process.cwd(), "content", "places");

export const TOGSTREK_UNITED_STATES_CONTINENT = "north-america" as const;
export const TOGSTREK_UNITED_STATES_COUNTRY =
  "united-states-of-america" as const;

export function unitedStatesCountryHubDirPath(): string {
  return path.join(
    PLACES_ROOT,
    TOGSTREK_UNITED_STATES_CONTINENT,
    TOGSTREK_UNITED_STATES_COUNTRY,
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
 * Top-level directories under `united-states-of-america/` that contain at least
 * one `.mdx` somewhere beneath (typically `state/city.mdx`).
 */
export function discoverUnitedStatesStateDirectorySlugs(): string[] {
  const root = unitedStatesCountryHubDirPath();
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
 * `/north-america/united-states-of-america/{state}` when `{state}/` is a directory
 * with nested MDX and there is no leaf `{state}.mdx` at the country root.
 */
export function isUnitedStatesStateHubRoute(
  continent: string,
  country: string,
  place: string[],
): boolean {
  if (
    continent !== TOGSTREK_UNITED_STATES_CONTINENT ||
    country !== TOGSTREK_UNITED_STATES_COUNTRY
  ) {
    return false;
  }
  if (place.length !== 1) return false;
  if (togstrekPlaceMdxExists(continent, country, place)) return false;
  const state = place[0]!;
  const stateDir = path.join(unitedStatesCountryHubDirPath(), state);
  try {
    if (!fs.statSync(stateDir).isDirectory()) return false;
  } catch {
    return false;
  }
  return directoryContainsMdx(stateDir);
}

export function listPlaceSlugsForUnitedStatesState(
  stateSlug: string,
): { place: string[] }[] {
  return discoverTogstrekPlaceSlugs()
    .filter(
      (s) =>
        s.continent === TOGSTREK_UNITED_STATES_CONTINENT &&
        s.country === TOGSTREK_UNITED_STATES_COUNTRY &&
        s.place.length >= 2 &&
        s.place[0] === stateSlug,
    )
    .map((s) => ({ place: s.place }))
    .sort((a, b) =>
      a.place.join("/").localeCompare(b.place.join("/"), undefined, {
        sensitivity: "base",
      }),
    );
}

export function discoverUnitedStatesStateHubParams(): TogstrekPlaceSlugParams[] {
  return discoverUnitedStatesStateDirectorySlugs()
    .filter(
      (state) =>
        !togstrekPlaceMdxExists(
          TOGSTREK_UNITED_STATES_CONTINENT,
          TOGSTREK_UNITED_STATES_COUNTRY,
          [state],
        ),
    )
    .map((state) => ({
      continent: TOGSTREK_UNITED_STATES_CONTINENT,
      country: TOGSTREK_UNITED_STATES_COUNTRY,
      place: [state],
    }));
}

export function countPlacesInUnitedStatesState(stateSlug: string): number {
  return listPlaceSlugsForUnitedStatesState(stateSlug).length;
}
