"use client";

import dynamic from "next/dynamic";

import type { TogstrekMapPlace } from "@/components/togstrek-explore-map/types";

const TogstrekExploreMap = dynamic(
  () =>
    import("@/components/togstrek-explore-map").then((m) => m.TogstrekExploreMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="togstrek-country-hub-map-loading flex h-[min(40vh,20rem)] items-center justify-center rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-muted font-tt-body text-tt-text-secondary sm:h-[min(48vh,26rem)] lg:h-[min(56vh,35rem)]"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

type TogstrekCountryHubMapProps = {
  places: TogstrekMapPlace[];
  visitedCountryIso2?: string[];
  countryLabel: string;
  className?: string;
};

export function TogstrekCountryHubMap({
  places,
  visitedCountryIso2,
  countryLabel,
  className = "",
}: TogstrekCountryHubMapProps) {
  if (places.length === 0) {
    return (
      <div
        className={`togstrek-country-hub-map-empty rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-muted px-6 py-12 text-center font-tt-body text-tt-text-secondary ${className}`}
        role="status"
      >
        No coordinates on place pages yet — add lat/lng in frontmatter to show pins.
      </div>
    );
  }

  return (
    <div className={`togstrek-country-hub-map ${className}`}>
      <TogstrekExploreMap
        places={places}
        visitedCountryIso2={visitedCountryIso2}
        popupCtaLabel="Open story"
        aria-label={`Map of places in ${countryLabel}`}
      />
    </div>
  );
}
