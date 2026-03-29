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
        className="togstrek-hiking-map-section-loading flex h-[min(40vh,22rem)] items-center justify-center rounded-[var(--tt-radius-sm)] border border-tt-border-muted bg-tt-surface-muted font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary sm:h-[min(48vh,26rem)]"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

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
      ? "Where these hikes go. Pins mark each trail report by coordinates — zoom in to untangle the clusters."
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
