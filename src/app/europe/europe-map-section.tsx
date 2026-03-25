import { TogstrekVisitedDashboardClient } from "@/components/togstrek-visited/togstrek-visited-dashboard-client";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

export function EuropeMapSection() {
  const data = buildTogstrekVisitedTravelDataset();
  return <TogstrekVisitedDashboardClient data={data} lockedContinent="europe" />;
}
