import { TogstrekVisitedDashboardClient } from "@/components/togstrek-visited/togstrek-visited-dashboard-client";
import type {
  TogstrekVisitedContinentId,
  TogstrekVisitedTravelDataset,
} from "@/lib/togstrek-visited-travel-data";

type TogstrekContinentHubMapSectionProps = {
  lockedContinent: TogstrekVisitedContinentId;
  data: TogstrekVisitedTravelDataset;
};

/** Map + stats block for continent hub pages (scoped continent). */
export function TogstrekContinentHubMapSection({
  lockedContinent,
  data,
}: TogstrekContinentHubMapSectionProps) {
  return (
    <TogstrekVisitedDashboardClient data={data} lockedContinent={lockedContinent} />
  );
}
