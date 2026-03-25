import type { Metadata } from "next";

import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  togstrekCountryHubPathByIso2,
  togstrekEuropeSpecialTerritories,
} from "@/data/togstrek-country-hub-paths";
import { togstrekUn195Countries } from "@/data/togstrek-un195-countries";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

import { EuropeMapSection } from "./europe-map-section";

const EUROPE_HERO_IMAGE =
  "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1676558893598-X9ZAV37ZVOCFSNYWMUSF/22e59112fefb45ea.jpg?format=2500w";

const europeUn195Countries = togstrekUn195Countries
  .filter((c) => c.continent === "europe")
  .sort((a, b) => a.name.localeCompare(b.name));

const europeCountryHubCount = europeUn195Countries.filter(
  (c) => togstrekCountryHubPathByIso2[c.iso2],
).length;

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Exploring Europe",
  description:
    "The 50 countries who host both the largest and smallest nations in the world — photo essays and travel notes from across Europe.",
  path: "/europe",
  openGraphDescription:
    "From Alpine ridges to Baltic towns — stories and images from Tog's Trek across Europe.",
  openGraphImages: [
    {
      url: "https://static1.squarespace.com/static/6207d70ece223e42dd9ae587/t/62430201c259e80324888871/1648558593135/IMG_4140.jpg?format=1500w",
      width: 1500,
      height: 1000,
      alt: "Tog's Trek",
    },
  ],
});

export default function EuropeLandingPage() {
  return (
    <main className="togstrek-europe-landing w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekPageHero
        variant="landing"
        imageSrc={EUROPE_HERO_IMAGE}
        imageAlt="Mountain landscape with snow-capped peaks, rocky terrain, and blue sky, intersected by cables."
        eyebrow="Europe"
        title="Exploring Europe"
        titleId="togstrek-europe-landing-title"
        quote={{
          attribution: "Eddie Izzard",
          children: (
            <>
              I grew up in <span className="text-tt-accent">Europe</span>, where
              the history comes from.
            </>
          ),
        }}
      />

      <TogstrekContentWidth className="py-[var(--tt-space-16)]">
        <TogstrekFeaturedAdventure
          layout="panel"
          sectionAriaLabelledBy="togstrek-europe-adventure-heading"
        />

        <section
          className="togstrek-europe-landing-map mt-[var(--tt-space-20)]"
          aria-labelledby="togstrek-europe-map-heading"
        >
          <TogstrekSectionHeader
            id="togstrek-europe-map-heading"
            title="On the map"
            description="Live travel progress for Europe: coverage against the UN country list, visited country/city counts, and an interactive map that switches between country and city views."
          />
          <div className="mt-[var(--tt-space-10)]">
            <EuropeMapSection />
          </div>
        </section>

        <section
          className="togstrek-europe-landing-special-territories mt-[var(--tt-space-20)]"
          aria-labelledby="togstrek-europe-special-territories-heading"
        >
          <TogstrekSectionHeader
            id="togstrek-europe-special-territories-heading"
            title="Special territories"
            description="Places with their own story collections — not counted as separate countries on the UN list."
          />
          <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {togstrekEuropeSpecialTerritories.map((t) => (
              <li key={t.href}>
                <TogstrekLinkCard
                  variant="compact"
                  href={t.href}
                  title={t.label}
                  meta={t.note}
                />
              </li>
            ))}
          </ul>
        </section>

        <section
          className="togstrek-europe-landing-countries mt-[var(--tt-space-20)]"
          aria-labelledby="togstrek-europe-countries-heading"
        >
          <TogstrekSectionHeader
            id="togstrek-europe-countries-heading"
            title="Countries"
            description={
              <>
                All sovereign states in Europe on the UN-style list of 195
                (member states, observers, and Guinea-Bissau).{" "}
                <span className="text-tt-text-primary">
                  {europeCountryHubCount} of {europeUn195Countries.length}
                </span>{" "}
                have a hub page so far; others stay on the list for coverage at
                a glance.
              </>
            }
          />
          <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {europeUn195Countries.map((c) => {
              const href = togstrekCountryHubPathByIso2[c.iso2];
              return (
                <li key={c.iso2}>
                  <TogstrekLinkCard
                    variant="compact"
                    href={href}
                    title={c.name}
                  />
                </li>
              );
            })}
          </ul>
        </section>
      </TogstrekContentWidth>
    </main>
  );
}
