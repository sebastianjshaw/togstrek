import type { Metadata } from "next";

import {
  continentHubHeroQuoteForSlug,
  TogstrekContinentHubCountriesSection,
  TogstrekContinentHubMapSection,
  TogstrekContinentHubTemplate,
} from "@/components/togstrek-hub";
import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import { togstrekEuropeSpecialTerritories } from "@/data/togstrek-country-hub-paths";
import { togstrekEuropeHubPageMeta } from "@/data/togstrek-continent-hub-meta";
import { togstrekUn195Countries } from "@/data/togstrek-un195-countries";
import { formatContinentEyebrow } from "@/lib/togstrek-geo-labels";
import {
  TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION,
  togstrekHubOnTheMapSectionDescription,
} from "@/lib/togstrek-hub-section-copy";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

const continent = "europe" as const;

const europeUn195Countries = togstrekUn195Countries
  .filter((c) => c.continent === continent)
  .sort((a, b) => a.name.localeCompare(b.name));

const meta = togstrekEuropeHubPageMeta;

export const metadata: Metadata = buildTogstrekMetadata({
  title: meta.title,
  description: meta.description,
  path: meta.path,
  openGraphDescription:
    "From Alpine ridges to Baltic harbours — photo essays and travel notes across Europe on Tog's Trek.",
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
        description={togstrekHubOnTheMapSectionDescription(eyebrow)}
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
        description={TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION}
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
    <TogstrekContinentHubCountriesSection
      continent={continent}
      unCountries={europeUn195Countries}
      travelData={travelData}
      regionPhrase="in Europe"
      sectionHeadingId="togstrek-europe-countries-heading"
    />
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
