import type { TogstrekMapPlace } from "@/components/togstrek-explore-map";

import type { TogstrekVisitedCountryMarker } from "./togstrek-visited-travel-data";

export function countryMarkersToMapPlaces(
  markers: TogstrekVisitedCountryMarker[],
): TogstrekMapPlace[] {
  return markers.map((row) => ({
    id: `country-${row.id}`,
    href: row.href,
    title: row.countryLabel,
    excerpt:
      row.citiesVisited === 1
        ? "1 place story in this country."
        : `${row.citiesVisited} place stories in this country.`,
    longitude: row.longitude,
    latitude: row.latitude,
  }));
}

export function countryMarkersToVisitedIso2(
  markers: TogstrekVisitedCountryMarker[],
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of markers) {
    if (m.iso2 && !seen.has(m.iso2)) {
      seen.add(m.iso2);
      out.push(m.iso2);
    }
  }
  return out;
}
