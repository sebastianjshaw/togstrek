"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

import type { TogstrekMapPlace } from "@/components/togstrek-explore-map";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";

const TogstrekExploreMap = dynamic(
  () =>
    import("@/components/togstrek-explore-map").then((m) => m.TogstrekExploreMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="togstrek-home-visited-map-loading flex h-[min(40vh,20rem)] items-center justify-center rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-muted font-tt-body text-tt-text-secondary sm:h-[min(48vh,26rem)] lg:h-[min(56vh,35rem)]"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

export type TogstrekHomeVisitedMapClientProps = {
  places: TogstrekMapPlace[];
  visitedCountryIso2: string[];
  visitedCountries: number;
  totalCountries: number;
  visitedPlaces: number;
  /** Same rounding as `buildTogstrekVisitedTravelDataset` global coverage. */
  coveragePercent: number;
};

function formatCoverageDisplay(value: number): string {
  return `${value.toFixed(1)}%`;
}

function togstrekHomeVisitedMapStatCard(
  label: string,
  value: string,
  subline?: string,
) {
  return (
    <article
      className="togstrek-home-visited-map-stat-card rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-muted px-3 py-3 sm:px-4 sm:py-4"
      aria-label={subline ? `${label}: ${value}. ${subline}` : `${label}: ${value}`}
    >
      <p className="font-tt-body text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-tertiary">
        {label}
      </p>
      <p className="mt-2 font-tt-display text-[clamp(1.15rem,1.8vw,1.65rem)] font-extrabold text-tt-text-primary">
        {value}
      </p>
      {subline ? (
        <p className="mt-1 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary">
          {subline}
        </p>
      ) : null}
    </article>
  );
}

export function TogstrekHomeVisitedMapClient({
  places,
  visitedCountryIso2,
  visitedCountries,
  totalCountries,
  visitedPlaces,
  coveragePercent,
}: TogstrekHomeVisitedMapClientProps) {
  return (
    <section
      className="togstrek-home-visited-map-section border-t border-tt-border-muted bg-tt-surface-base py-[var(--tt-space-16)] md:py-[var(--tt-space-20)]"
      aria-labelledby="togstrek-home-visited-map-heading"
    >
      <TogstrekContentWidth>
        <div className="flex flex-col gap-[var(--tt-space-8)] lg:flex-row lg:items-end lg:justify-between lg:gap-[var(--tt-space-10)]">
          <TogstrekSectionHeader
            id="togstrek-home-visited-map-heading"
            title="Countries visited"
            description={
              <p>
                The map shows {places.length} countries with a story pinned
                (of {visitedCountries}{" "}
                I&apos;ve written about so far). Tap a marker to open the
                country hub.
              </p>
            }
          />
          <p className="shrink-0 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary lg:pb-[var(--tt-space-1)]">
            <Link
              href="/visited-map"
              className="font-semibold text-tt-accent underline decoration-tt-accent/35 underline-offset-[0.2em] transition-colors hover:text-tt-accent-hover hover:decoration-tt-accent-hover"
            >
              Open the full visited map
            </Link>
          </p>
        </div>

        <div className="togstrek-home-visited-map-map-wrap mt-[var(--tt-space-10)] flex flex-col gap-[var(--tt-space-5)]">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {togstrekHomeVisitedMapStatCard(
              "Countries visited",
              `${visitedCountries}`,
              `${totalCountries} total`,
            )}
            {togstrekHomeVisitedMapStatCard(
              "Coverage",
              formatCoverageDisplay(coveragePercent),
            )}
            {togstrekHomeVisitedMapStatCard(
              "Places visited",
              `${visitedPlaces}`,
            )}
            {togstrekHomeVisitedMapStatCard(
              "Map mode",
              "Countries",
              "Aggregated by country centroid",
            )}
          </div>
          <TogstrekExploreMap
            places={places}
            visitedCountryIso2={visitedCountryIso2}
            aria-label={`Countries visited: ${places.length} countries with place stories`}
            popupCtaLabel="View country"
          />
        </div>
      </TogstrekContentWidth>
    </section>
  );
}
