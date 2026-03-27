"use client";

import { TogstrekExploreMap } from "@/components/togstrek-explore-map/togstrek-explore-map";
import type { TogstrekMapPlace } from "@/components/togstrek-explore-map/types";

type TogstrekHikingMapSectionProps = {
  places: TogstrekMapPlace[];
  /** Hub vs group — different heading copy */
  variant: "hub" | "group";
};

export function TogstrekHikingMapSection({
  places,
  variant,
}: TogstrekHikingMapSectionProps) {
  if (places.length === 0) return null;

  const heading =
    variant === "hub" ? "Where these hikes are" : "Stages on this trail";
  const blurb =
    variant === "hub"
      ? "Pins use coordinates from each trail report. Zoom in to explore clusters."
      : "Coordinates from each stage’s frontmatter.";

  return (
    <section
      className="togstrek-hiking-map-section mt-[var(--tt-space-12)] min-w-0 border-t border-tt-border-muted pt-[var(--tt-space-12)]"
      aria-labelledby="togstrek-hiking-map-heading"
    >
      <h2
        id="togstrek-hiking-map-heading"
        className="font-tt-display text-[length:var(--tt-text-title)] font-bold leading-[var(--tt-leading-tight)] text-tt-text-primary"
      >
        {heading}
      </h2>
      <p className="togstrek-hiking-map-section-lead mt-[var(--tt-space-3)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
        {blurb}
      </p>
      <TogstrekExploreMap
        places={places}
        aria-label="Hiking trails on the map"
        popupCtaLabel="Open trail report"
        className="mt-[var(--tt-space-6)]"
      />
    </section>
  );
}
