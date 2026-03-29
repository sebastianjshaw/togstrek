import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  continentHubHeroQuoteForSlug,
  TogstrekContinentHubMapSection,
  TogstrekContinentHubTemplate,
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  togstrekAsiaSpecialTerritories,
  togstrekCountryHubPathByIso2,
} from "@/data/togstrek-country-hub-paths";
import { getTogstrekCountryHubTileQuote } from "@/data/togstrek-country-hub-list-quotes";
import {
  isTogstrekContinentHubRouteSlug,
  TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS,
  togstrekContinentHubPageMeta,
} from "@/data/togstrek-continent-hub-meta";
import { togstrekUn195Countries } from "@/data/togstrek-un195-countries";
import {
  formatContinentEyebrow,
  truncateDescription,
} from "@/lib/togstrek-geo-labels";
import {
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
  pickTogstrekCountryHubTileHeroFromPlaces,
} from "@/lib/togstrek-load-place-mdx";
import {
  TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION,
  TogstrekHubCountriesListIntro,
  togstrekHubOnTheMapSectionDescription,
} from "@/lib/togstrek-hub-section-copy";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

type PageParams = { continent: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  return TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS.map((continent) => ({ continent }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent } = await params;
  if (!isTogstrekContinentHubRouteSlug(continent)) {
    return { title: "Not found" };
  }
  const meta = togstrekContinentHubPageMeta[continent];
  return buildTogstrekMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
    openGraphDescription: meta.description,
    openGraphImages: meta.openGraphImages,
  });
}

export default async function ContinentHubPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent } = await params;
  if (!isTogstrekContinentHubRouteSlug(continent)) {
    notFound();
  }

  const meta = togstrekContinentHubPageMeta[continent];
  const travelData = buildTogstrekVisitedTravelDataset();

  const antarcticPlaceRows =
    continent === "antarctica"
      ? listTogstrekPlaceSlugsForCountry("antarctica", "antarctic")
      : [];

  const un195ForContinent = togstrekUn195Countries
    .filter((c) => c.continent === continent)
    .sort((a, b) => a.name.localeCompare(b.name));

  const hubCount = un195ForContinent.filter(
    (c) => togstrekCountryHubPathByIso2[c.iso2],
  ).length;

  const countriesDescriptionDefault = (
    <TogstrekHubCountriesListIntro
      regionPhrase="in this region"
      hubCount={hubCount}
      total={un195ForContinent.length}
    />
  );

  const countriesSectionDescription =
    meta.countriesDescription ?? countriesDescriptionDefault;

  const eyebrow = formatContinentEyebrow(continent);

  const mapSection = (
    <section
      className="togstrek-continent-hub-map mt-[var(--tt-space-4)]"
      aria-labelledby={`togstrek-continent-hub-map-heading-${continent}`}
    >
      <TogstrekSectionHeader
        id={`togstrek-continent-hub-map-heading-${continent}`}
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

  const afterMap =
    continent === "asia" ? (
      <section
        className="togstrek-continent-hub-special-territories mt-[var(--tt-space-20)]"
        aria-labelledby="togstrek-asia-special-territories-heading"
      >
        <TogstrekSectionHeader
          id="togstrek-asia-special-territories-heading"
          title="Special territories"
          description={TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION}
        />
        <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {togstrekAsiaSpecialTerritories.map((t) => (
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
    ) : continent === "antarctica" ? (
      <section
        className="togstrek-continent-hub-antarctic-places mt-[var(--tt-space-20)]"
        aria-labelledby="togstrek-antarctica-places-heading"
      >
        <TogstrekSectionHeader
          id="togstrek-antarctica-places-heading"
          title="Places"
          description="There are no sovereign states on the UN list for this continent. Each card opens a story — expedition stops, channels, harbours, and passages around the peninsula and Southern Ocean."
        />
        <ul className="togstrek-continent-hub-antarctic-places-grid mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {antarcticPlaceRows.map(({ place }) => {
            const fm = loadTogstrekPlaceFrontmatterOnly(
              "antarctica",
              "antarctic",
              place,
            );
            const href = `/antarctica/antarctic/${place}`;
            return (
              <li
                key={place}
                className="togstrek-continent-hub-antarctic-places-item min-h-[var(--tt-region-card-min-height)] min-w-0"
              >
                <TogstrekLinkCard
                  variant="region"
                  href={href}
                  title={fm.title}
                  description={truncateDescription(fm.description)}
                  gradient={TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK}
                  imageSrc={fm.heroImage?.src}
                  imageAlt={fm.heroImage?.alt}
                />
              </li>
            );
          })}
        </ul>
      </section>
    ) : null;

  const countriesSection =
    continent === "antarctica" ? null : (
      <section
        className="togstrek-continent-hub-countries mt-[var(--tt-space-20)]"
        aria-labelledby={`togstrek-continent-hub-countries-heading-${continent}`}
      >
        <TogstrekSectionHeader
          id={`togstrek-continent-hub-countries-heading-${continent}`}
          title="Countries"
          description={countriesSectionDescription}
        />
        {un195ForContinent.length > 0 ? (
          <ul className="togstrek-continent-hub-countries-grid mt-[var(--tt-space-10)] grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3">
            {un195ForContinent.map((c) => {
              const href =
                togstrekCountryHubPathByIso2[c.iso2] ??
                travelData.countryStoryHrefByIso2[c.iso2];
              const quote = getTogstrekCountryHubTileQuote(c.iso2);
              const tileHero = pickTogstrekCountryHubTileHeroFromPlaces({
                continentSlug: continent,
                unCountryName: c.name,
                hubHref: href,
              });
              return (
                <li
                  key={c.iso2}
                  className="togstrek-continent-hub-countries-item flex min-h-0 min-w-0 flex-col"
                >
                  <TogstrekLinkCard
                    variant="compact"
                    href={href}
                    title={c.name}
                    quote={quote}
                    size="comfortable"
                    imageSrc={tileHero?.src}
                    imageAlt={tileHero?.alt}
                  />
                </li>
              );
            })}
          </ul>
        ) : null}
      </section>
    );

  return (
    <TogstrekContinentHubTemplate
      hero={{
        eyebrow,
        title: meta.title,
        titleId: `togstrek-continent-hub-title-${continent}`,
        imageSrc: meta.heroImageSrc,
        imageAlt: meta.heroImageAlt,
        quote: continentHubHeroQuoteForSlug(continent),
      }}
      mapSection={mapSection}
      afterMap={afterMap}
      countriesSection={countriesSection}
    />
  );
}
