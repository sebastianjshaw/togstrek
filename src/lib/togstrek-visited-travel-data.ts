import {
  discoverTogstrekPlaceSlugs,
  loadTogstrekPlaceFrontmatterOnly,
} from "@/lib/togstrek-load-place-mdx";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import {
  formatSlugLabel,
  togstrekUnCountryNameToUrlSlug,
} from "@/lib/togstrek-geo-labels";
import {
  togstrekUn195Countries,
  type TogstrekUnContinentId,
} from "@/data/togstrek-un195-countries";

export type TogstrekVisitedContinentId = Exclude<TogstrekUnContinentId, "other">;

export type TogstrekVisitedContinentSummary = {
  id: TogstrekVisitedContinentId;
  label: string;
  totalCountries: number;
  visitedCountries: number;
  visitedCities: number;
  coveragePercent: number;
};

export type TogstrekVisitedCountryMarker = {
  id: string;
  continent: TogstrekVisitedContinentId;
  countrySlug: string;
  countryLabel: string;
  citiesVisited: number;
  href: string;
  latitude: number;
  longitude: number;
  /** ISO 3166-1 alpha-2 when matched to the UN list by URL country slug. */
  iso2?: string;
};

export type TogstrekVisitedCityMarker = {
  id: string;
  continent: TogstrekVisitedContinentId;
  countrySlug: string;
  href: string;
  title: string;
  excerpt: string;
  latitude: number;
  longitude: number;
  thumbnailSrc?: string;
  thumbnailAlt?: string;
};

export type TogstrekVisitedTravelDataset = {
  generatedAtIso: string;
  global: {
    totalCountries: number;
    visitedCountries: number;
    visitedCities: number;
    coveragePercent: number;
  };
  continents: TogstrekVisitedContinentSummary[];
  countryMarkers: TogstrekVisitedCountryMarker[];
  cityMarkers: TogstrekVisitedCityMarker[];
  /**
   * Country hub URL `/{continent}/{country}` per ISO2 when place content exists.
   * Used when no legacy flat hub exists in `togstrekCountryHubPathByIso2`.
   */
  countryStoryHrefByIso2: Record<string, string>;
};

const CONTINENT_ORDER: TogstrekVisitedContinentId[] = [
  "africa",
  "asia",
  "europe",
  "north-america",
  "south-america",
  "oceania",
  "antarctica",
];

const CONTINENT_LABELS: Record<TogstrekVisitedContinentId, string> = {
  africa: "Africa",
  asia: "Asia",
  europe: "Europe",
  "north-america": "North America",
  "south-america": "South America",
  oceania: "Oceania",
  antarctica: "Antarctica",
};

function percent(visited: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((visited / total) * 1000) / 10;
}

/** URL slugs that do not match `togstrekUnCountryNameToUrlSlug(UN name)` but map to an ISO2 row. */
const TOGSTREK_COUNTRY_SLUG_ISO2: Record<string, string> = {
  turkiye: "TR",
  turkey: "TR",
  /** Matches place content folder + hub slug (UN auto-slug is `united-states`). */
  "united-states-of-america": "US",
  /** Legacy short slug → same ISO2 for maps / visited. */
  usa: "US",
};

function resolveIso2ForCountrySlug(
  continent: TogstrekVisitedContinentId,
  countrySlug: string,
): string | undefined {
  const mapped = TOGSTREK_COUNTRY_SLUG_ISO2[countrySlug.toLowerCase()];
  if (mapped) return mapped;
  const row = togstrekUn195Countries.find(
    (c) =>
      c.continent === continent &&
      togstrekUnCountryNameToUrlSlug(c.name) === countrySlug,
  );
  return row?.iso2;
}

/** ISO 3166-1 alpha-2 for a URL country slug when it matches the UN list (e.g. maps, hubs). */
export function getIso2ForCountrySlug(
  continent: string,
  countrySlug: string,
): string | undefined {
  return resolveIso2ForCountrySlug(
    continent as TogstrekVisitedContinentId,
    countrySlug,
  );
}

export function buildTogstrekVisitedTravelDataset(): TogstrekVisitedTravelDataset {
  const placeSlugs = discoverTogstrekPlaceSlugs();
  const countrySets = new Map<TogstrekVisitedContinentId, Set<string>>();
  const cityCounts = new Map<TogstrekVisitedContinentId, number>();
  const cityMarkers: TogstrekVisitedCityMarker[] = [];

  const byCountry = new Map<
    string,
    {
      continent: TogstrekVisitedContinentId;
      countrySlug: string;
      citiesVisited: number;
      sumLat: number;
      sumLng: number;
      coordsCount: number;
    }
  >();

  for (const s of placeSlugs) {
    const fm = loadTogstrekPlaceFrontmatterOnly(s.continent, s.country, s.place);
    const continent = fm.continentSlug as TogstrekVisitedContinentId;
    const placeTail = togstrekPlacePathFromSegments(s.place);
    const placeHref = `/${s.continent}/${s.country}/${placeTail}`;
    const key = `${continent}:${fm.countrySlug}`;

    const set = countrySets.get(continent) ?? new Set<string>();
    set.add(fm.countrySlug);
    countrySets.set(continent, set);

    cityCounts.set(continent, (cityCounts.get(continent) ?? 0) + 1);

    const current = byCountry.get(key) ?? {
      continent,
      countrySlug: fm.countrySlug,
      citiesVisited: 0,
      sumLat: 0,
      sumLng: 0,
      coordsCount: 0,
    };
    current.citiesVisited += 1;
    if (typeof fm.lat === "number" && typeof fm.lng === "number") {
      current.sumLat += fm.lat;
      current.sumLng += fm.lng;
      current.coordsCount += 1;
      cityMarkers.push({
        id: `${continent}-${fm.countrySlug}-${fm.placeSlug}`,
        continent,
        countrySlug: fm.countrySlug,
        href: placeHref,
        title: fm.title,
        excerpt: fm.description,
        latitude: fm.lat,
        longitude: fm.lng,
        thumbnailSrc: fm.heroImage?.src,
        thumbnailAlt: fm.heroImage?.alt,
      });
    }
    byCountry.set(key, current);
  }

  const countryMarkers: TogstrekVisitedCountryMarker[] = [...byCountry.entries()]
    .filter(([, value]) => value.coordsCount > 0)
    .map(([key, value]) => {
      const iso2 = resolveIso2ForCountrySlug(
        value.continent,
        value.countrySlug,
      );
      const countryHubHref = `/${value.continent}/${value.countrySlug}`;
      return {
        id: key,
        continent: value.continent,
        countrySlug: value.countrySlug,
        countryLabel: formatSlugLabel(value.countrySlug),
        citiesVisited: value.citiesVisited,
        href: countryHubHref,
        latitude: value.sumLat / value.coordsCount,
        longitude: value.sumLng / value.coordsCount,
        iso2,
      };
    });

  const countryStoryHrefByIso2: Record<string, string> = {};
  for (const m of countryMarkers) {
    if (m.iso2) {
      countryStoryHrefByIso2[m.iso2] = `/${m.continent}/${m.countrySlug}`;
    }
  }

  const continents: TogstrekVisitedContinentSummary[] = CONTINENT_ORDER.map((id) => {
    const totalCountries = togstrekUn195Countries.filter(
      (c) => c.continent === id,
    ).length;
    const visitedCountries = countrySets.get(id)?.size ?? 0;
    const visitedCities = cityCounts.get(id) ?? 0;
    return {
      id,
      label: CONTINENT_LABELS[id],
      totalCountries,
      visitedCountries,
      visitedCities,
      coveragePercent: percent(visitedCountries, totalCountries),
    };
  });

  const visitedCountries = [...countrySets.values()].reduce(
    (sum, set) => sum + set.size,
    0,
  );
  const visitedCities = placeSlugs.length;
  const totalCountries = togstrekUn195Countries.length;

  return {
    generatedAtIso: new Date().toISOString(),
    global: {
      totalCountries,
      visitedCountries,
      visitedCities,
      coveragePercent: percent(visitedCountries, totalCountries),
    },
    continents,
    countryMarkers,
    cityMarkers,
    countryStoryHrefByIso2,
  };
}
