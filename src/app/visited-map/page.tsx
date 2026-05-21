import type { Metadata } from "next";

import { TogstrekVisitedDashboardClient } from "@/components/togstrek-visited/togstrek-visited-dashboard-client";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { togstrekMainLandmarkProps } from "@/lib/togstrek-main-landmark";
import { TOGSTREK_PAGE_SECTION_Y } from "@/lib/togstrek-layout";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

const VISITED_MAP_DESCRIPTION =
  "Interactive map of where Tog’s Trek has published place stories: filter by continent, switch between country and place pins, and see coverage against the full UN country list.";

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Visited map",
  description: VISITED_MAP_DESCRIPTION,
  path: "/visited-map",
  type: "website",
  openGraphDescription: VISITED_MAP_DESCRIPTION,
});

export default function VisitedMapPage() {
  const data = buildTogstrekVisitedTravelDataset();

  return (
    <main
      {...togstrekMainLandmarkProps}
      className="togstrek-visited-map-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]"
    >
      <TogstrekContentWidth className={TOGSTREK_PAGE_SECTION_Y}>
        <TogstrekPageTitle id="togstrek-visited-map-title">
          Visited map
        </TogstrekPageTitle>
        <p className="togstrek-visited-map-lead mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          {VISITED_MAP_DESCRIPTION}
        </p>
        <p className="togstrek-visited-map-hint mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-relaxed)] text-tt-text-tertiary">
          The home page shows a compact country view of the same data. Here you
          can zoom a region, open a country hub from a marker, and inspect place
          pins when you switch map mode.
        </p>
        <div className="togstrek-visited-map-dashboard mt-[var(--tt-space-10)]">
          <TogstrekVisitedDashboardClient data={data} />
        </div>
      </TogstrekContentWidth>
    </main>
  );
}
