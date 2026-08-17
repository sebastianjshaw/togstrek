import { TogstrekHomeVisitedMapClient } from "@/components/togstrek-home/togstrek-home-visited-map-client";
import {
  countryMarkersToMapPlaces,
  countryMarkersToVisitedIso2,
} from "@/lib/togstrek-visited-map-helpers";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

/** Homepage map of all countries that have at least one geocoded place story. */
export function TogstrekHomeVisitedMapSection() {
  const travel = buildTogstrekVisitedTravelDataset();
  if (travel.countryMarkers.length === 0) {
    return null;
  }

  return (
    <TogstrekHomeVisitedMapClient
      places={countryMarkersToMapPlaces(travel.countryMarkers)}
      visitedCountryIso2={countryMarkersToVisitedIso2(travel.countryMarkers)}
      visitedCountries={travel.global.visitedCountries}
      totalCountries={travel.global.totalCountries}
      visitedPlaces={travel.global.visitedCities}
      coveragePercent={travel.global.coveragePercent}
      specialTerritories={travel.specialTerritories}
      uniqueLocations={travel.uniqueLocations}
    />
  );
}
