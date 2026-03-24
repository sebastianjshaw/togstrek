"use client";

import dynamic from "next/dynamic";

import type { TogstrekMapPlace } from "@/components/togstrek-explore-map";

const TogstrekExploreMap = dynamic(
  () =>
    import("@/components/togstrek-explore-map").then((m) => m.TogstrekExploreMap),
  {
    ssr: false,
    loading: () => (
      <div
        className="flex h-[min(40vh,20rem)] items-center justify-center rounded-[var(--tt-radius-sm)] border border-tt-border-muted bg-tt-surface-muted font-tt-body text-tt-text-secondary sm:h-[min(48vh,26rem)] lg:h-[min(56vh,35rem)]"
        role="status"
      >
        Loading map…
      </div>
    ),
  },
);

export function MapDemoClient({ places }: { places: TogstrekMapPlace[] }) {
  return (
    <TogstrekExploreMap places={places} aria-label="Demo places in Europe" />
  );
}
