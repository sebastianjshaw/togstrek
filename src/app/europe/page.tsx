import type { Metadata } from "next";

import {
  continentHubHeroQuoteForSlug,
  TogstrekContinentHubMapSection,
  TogstrekContinentHubTemplate,
} from "@/components/togstrek-hub";
import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  togstrekCountryHubPathByIso2,
  togstrekEuropeSpecialTerritories,
} from "@/data/togstrek-country-hub-paths";
import { togstrekEuropeHubPageMeta } from "@/data/togstrek-continent-hub-meta";
import { togstrekUn195Countries } from "@/data/togstrek-un195-countries";
import { formatContinentEyebrow } from "@/lib/togstrek-geo-labels";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

const continent = "europe" as const;

const europeUn195Countries = togstrekUn195Countries
  .filter((c) => c.continent === continent)
  .sort((a, b) => a.name.localeCompare(b.name));

const europeCountryHubCount = europeUn195Countries.filter(
  (c) => togstrekCountryHubPathByIso2[c.iso2],
).length;

const meta = togstrekEuropeHubPageMeta;

export const metadata: Metadata = buildTogstrekMetadata({
  title: meta.title,
  description: meta.description,
  path: meta.path,
  openGraphDescription:
    "From Alpine ridges to Baltic towns — stories and images from Tog's Trek across Europe.",
  openGraphImages: meta.openGraphImages,
});

export default function EuropeLandingPage() {
  const travelData = buildTogstrekVisitedTravelDataset();
  const eyebrow = formatContinentEyebrow(continent);

  const beforeContent = (
    <TogstrekFeaturedAdventure
      layout="panel"
      sectionAriaLabelledBy="togstrek-europe-adventure-heading"
    />
  );

  const mapSection = (
    <section
      className="togstrek-continent-hub-map mt-[var(--tt-space-20)]"
      aria-labelledby="togstrek-europe-map-heading"
    >
      <TogstrekSectionHeader
        id="togstrek-europe-map-heading"
        title="On the map"
        description={`Live travel progress for ${eyebrow}: coverage against the UN country list, visited country and city counts, and an interactive map that switches between country and city views.`}
      />
      <div className="mt-[var(--tt-space-10)]">
        <TogstrekContinentHubMapSection
          lockedContinent={continent}
          data={travelData}
        />
      </div>
    </section>
  );

  const afterMap = (
    <section
      className="togstrek-continent-hub-special-territories mt-[var(--tt-space-20)]"
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
  );

  const countriesSection = (
    <section
      className="togstrek-continent-hub-countries mt-[var(--tt-space-20)]"
      aria-labelledby="togstrek-europe-countries-heading"
    >
      <TogstrekSectionHeader
        id="togstrek-europe-countries-heading"
        title="Countries"
        description={
          <>
            All sovereign states in Europe on the UN-style list of 195 (member
            states, observers, and Guinea-Bissau).{" "}
            <span className="text-tt-text-primary">
              {europeCountryHubCount} of {europeUn195Countries.length}
            </span>{" "}
            have a hub page so far; others stay on the list for coverage at a
            glance.
          </>
        }
      />
      <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {europeUn195Countries.map((c) => {
          const href =
            togstrekCountryHubPathByIso2[c.iso2] ??
            travelData.countryStoryHrefByIso2[c.iso2];
          return (
            <li key={c.iso2}>
              <TogstrekLinkCard variant="compact" href={href} title={c.name} />
            </li>
          );
        })}
      </ul>
    </section>
  );

  return (
    <TogstrekContinentHubTemplate
      hero={{
        eyebrow,
        title: meta.title,
        titleId: "togstrek-continent-hub-title-europe",
        imageSrc: meta.heroImageSrc,
        imageAlt: meta.heroImageAlt,
        quote: continentHubHeroQuoteForSlug(continent),
      }}
      beforeContent={beforeContent}
      mapSection={mapSection}
      afterMap={afterMap}
      countriesSection={countriesSection}
    />
  );
}
