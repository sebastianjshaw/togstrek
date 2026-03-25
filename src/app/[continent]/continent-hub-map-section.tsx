import { TogstrekVisitedDashboardClient } from "@/components/togstrek-visited/togstrek-visited-dashboard-client";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";
import type { TogstrekVisitedContinentId } from "@/lib/togstrek-visited-travel-data";

type TogstrekContinentHubMapSectionProps = {
  lockedContinent: TogstrekVisitedContinentId;
};

export function TogstrekContinentHubMapSection({
  lockedContinent,
}: TogstrekContinentHubMapSectionProps) {
  const data = buildTogstrekVisitedTravelDataset();
  return (
    <TogstrekVisitedDashboardClient data={data} lockedContinent={lockedContinent} />
  );
}
