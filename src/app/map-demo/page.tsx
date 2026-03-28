import type { Metadata } from "next";

import { TogstrekVisitedDashboardClient } from "@/components/togstrek-visited/togstrek-visited-dashboard-client";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TOGSTREK_PAGE_SECTION_Y } from "@/lib/togstrek-layout";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

export const metadata: Metadata = {
  title: "Visited map",
};

export default function MapDemoPage() {
  const data = buildTogstrekVisitedTravelDataset();

  return (
    <main className="w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekContentWidth className={TOGSTREK_PAGE_SECTION_Y}>
        <TogstrekPageTitle>Visited map</TogstrekPageTitle>
        <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-text-secondary">
          Track coverage by country and city from published place stories. Switch
          between global and continent views, then toggle country vs city mapping.
        </p>
        <div className="mt-[var(--tt-space-10)]">
          <TogstrekVisitedDashboardClient data={data} />
        </div>
      </TogstrekContentWidth>
    </main>
  );
}
