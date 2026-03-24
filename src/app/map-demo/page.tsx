import type { Metadata } from "next";

import type { TogstrekMapPlace } from "@/components/togstrek-explore-map";

import { MapDemoClient } from "./map-demo-client";

export const metadata: Metadata = {
  title: "Map demo",
  robots: { index: false, follow: false },
};

/** Demo data — replace with MDX-derived places per hub page. */
const demoPlaces: TogstrekMapPlace[] = [
  {
    id: "moscow",
    href: "/europe/russia/moscow",
    title: "Moscow",
    excerpt:
      "Russia's largest city with a history traced back to 1147 — the northernmost megacity.",
    longitude: 37.6173,
    latitude: 55.7558,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1513326738677-b96460353616?w=800&q=80",
    thumbnailAlt: "Domes of a cathedral in Moscow",
  },
  {
    id: "paris",
    href: "/europe/france/paris",
    title: "Paris",
    excerpt: "River, light, and layers of history — a city made for walking.",
    longitude: 2.3522,
    latitude: 48.8566,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    thumbnailAlt: "Eiffel Tower and Paris skyline",
  },
  {
    id: "berlin",
    href: "/europe/germany/berlin",
    title: "Berlin",
    excerpt: "Reinvention, concrete, green space, and night trains.",
    longitude: 13.405,
    latitude: 52.52,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1587330979470-3595ac045ab0?w=800&q=80",
    thumbnailAlt: "Berlin TV tower",
  },
  {
    id: "stockholm",
    href: "/europe/sweden/stockholm",
    title: "Stockholm",
    excerpt: "Archipelago light and granite — home base between trips.",
    longitude: 18.0686,
    latitude: 59.3293,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1509356840521-f934ccebc619?w=800&q=80",
    thumbnailAlt: "Stockholm waterfront",
  },
  {
    id: "rome",
    href: "/europe/italy/rome",
    title: "Rome",
    excerpt: "Ancient stones, baroque fountains, and the best wrong turns.",
    longitude: 12.4964,
    latitude: 41.9028,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1552832230-01950db26b21?w=800&q=80",
    thumbnailAlt: "Roman forum",
  },
  {
    id: "oslo",
    href: "/europe/norway/oslo",
    title: "Oslo",
    excerpt: "Fjord edges and forest trails within city reach.",
    longitude: 10.7522,
    latitude: 59.9139,
  },
];

export default function MapDemoPage() {
  return (
    <main className="mx-auto w-full min-w-0 max-w-[var(--tt-layout-max-wide)] flex-1 px-[var(--tt-layout-gutter)] py-[var(--tt-space-12)] [overflow-wrap:anywhere]">
      <h1 className="font-tt-display text-[length:var(--tt-text-display)] font-bold tracking-[var(--tt-tracking-tight)] text-tt-text-primary">
        Explore map
      </h1>
      <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-text-secondary">
        Preview of the hub-page map: dark basemap, clustered counts, pins, and
        a story card with image + excerpt + link — same concept as your current
        site, restyled with design tokens.
      </p>
      <div className="mt-[var(--tt-space-10)]">
        <MapDemoClient places={demoPlaces} />
      </div>
    </main>
  );
}
