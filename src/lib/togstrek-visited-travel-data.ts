import {
  discoverTogstrekPlaceSlugs,
  loadTogstrekPlaceFrontmatterOnly,
} from "@/lib/togstrek-load-place-mdx";
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

function slugToLabel(slug: string): string {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function percent(visited: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((visited / total) * 1000) / 10;
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
      href: string;
      citiesVisited: number;
      sumLat: number;
      sumLng: number;
      coordsCount: number;
    }
  >();

  for (const s of placeSlugs) {
    const fm = loadTogstrekPlaceFrontmatterOnly(s.continent, s.country, s.place);
    const continent = fm.continentSlug as TogstrekVisitedContinentId;
    const href = `/${s.continent}/${s.country}/${s.place}`;
    const key = `${continent}:${fm.countrySlug}`;

    const set = countrySets.get(continent) ?? new Set<string>();
    set.add(fm.countrySlug);
    countrySets.set(continent, set);

    cityCounts.set(continent, (cityCounts.get(continent) ?? 0) + 1);

    const current = byCountry.get(key) ?? {
      continent,
      countrySlug: fm.countrySlug,
      href,
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
        href,
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
    .map(([key, value]) => ({
      id: key,
      continent: value.continent,
      countrySlug: value.countrySlug,
      countryLabel: slugToLabel(value.countrySlug),
      citiesVisited: value.citiesVisited,
      href: value.href,
      latitude: value.sumLat / value.coordsCount,
      longitude: value.sumLng / value.coordsCount,
    }));

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
  };
}
