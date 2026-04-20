import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  continentHubHeroQuoteForSlug,
  TogstrekContinentHubCountriesSection,
  TogstrekContinentHubMapSection,
  TogstrekContinentHubTemplate,
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub";
import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  TOGSTREK_CONTINENT_HUB_CROSS_LIST_ISO2_BY_CONTINENT,
  togstrekAsiaSpecialTerritories,
  togstrekEuropeSpecialTerritories,
} from "@/data/togstrek-country-hub-paths";
import {
  isTogstrekContinentHubRouteSlug,
  TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS,
  togstrekContinentHubPageMeta,
} from "@/data/togstrek-continent-hub-meta";
import {
  type TogstrekUn195Country,
  togstrekUn195Countries,
} from "@/data/togstrek-un195-countries";
import {
  formatContinentEyebrow,
  truncateDescription,
} from "@/lib/togstrek-geo-labels";
import {
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
} from "@/lib/togstrek-load-place-mdx";
import {
  buildTogstrekPlacePublicPath,
  togstrekPlacePathFromSegments,
} from "@/lib/togstrek-place-path";
import {
  TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION,
  togstrekHubOnTheMapSectionDescription,
} from "@/lib/togstrek-hub-section-copy";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import { buildTogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

/** Match country hub grid: stretch rows so compact cards share height; `li` flex lets `flex-1` on the link fill the cell. */
const togstrekContinentHubSpecialTerritoriesGridClass =
  "mt-[var(--tt-space-10)] grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3";

const togstrekContinentHubSpecialTerritoriesItemClass =
  "togstrek-continent-hub-special-territories-item flex min-h-0 min-w-0 flex-col";

type PageParams = { continent: string };

function buildUn195CountriesForContinentHub(
  continent: string,
): TogstrekUn195Country[] {
  const base = togstrekUn195Countries.filter((c) => c.continent === continent);
  const extraIso2 =
    TOGSTREK_CONTINENT_HUB_CROSS_LIST_ISO2_BY_CONTINENT[continent];
  if (!extraIso2?.length) {
    return [...base].sort((a, b) => a.name.localeCompare(b.name));
  }
  const byIso2 = new Map<string, TogstrekUn195Country>();
  for (const c of base) {
    byIso2.set(c.iso2, c);
  }
  for (const iso2 of extraIso2) {
    if (byIso2.has(iso2)) continue;
    const row = togstrekUn195Countries.find((c) => c.iso2 === iso2);
    if (row) byIso2.set(iso2, row);
  }
  return Array.from(byIso2.values()).sort((a, b) =>
    a.name.localeCompare(b.name),
  );
}

/** Only prebuilt continent hubs — unknown slugs 404 without touching the filesystem. */
export const dynamicParams = false;

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

  const un195ForContinent = buildUn195CountriesForContinentHub(continent);

  const eyebrow = formatContinentEyebrow(continent);

  const europeMapHeadingId = "togstrek-europe-map-heading";
  const mapSectionHeadingId =
    continent === "europe"
      ? europeMapHeadingId
      : `togstrek-continent-hub-map-heading-${continent}`;
  const mapSectionTopMarginClass =
    continent === "europe"
      ? "mt-[var(--tt-space-20)]"
      : "mt-[var(--tt-space-4)]";

  const mapSection = (
    <section
      className={`togstrek-continent-hub-map ${mapSectionTopMarginClass}`}
      aria-labelledby={mapSectionHeadingId}
    >
      <TogstrekSectionHeader
        id={mapSectionHeadingId}
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
    continent === "europe" ? (
      <section
        className="togstrek-continent-hub-special-territories mt-[var(--tt-space-20)]"
        aria-labelledby="togstrek-europe-special-territories-heading"
      >
        <TogstrekSectionHeader
          id="togstrek-europe-special-territories-heading"
          title="Special territories"
          description={TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION}
        />
        <ul className={togstrekContinentHubSpecialTerritoriesGridClass}>
          {togstrekEuropeSpecialTerritories.map((t) => (
            <li key={t.href} className={togstrekContinentHubSpecialTerritoriesItemClass}>
              <TogstrekLinkCard
                variant="compact"
                href={t.href}
                title={t.label}
                meta={t.note}
                size="comfortable"
              />
            </li>
          ))}
        </ul>
      </section>
    ) : continent === "asia" ? (
      <section
        className="togstrek-continent-hub-special-territories mt-[var(--tt-space-20)]"
        aria-labelledby="togstrek-asia-special-territories-heading"
      >
        <TogstrekSectionHeader
          id="togstrek-asia-special-territories-heading"
          title="Special territories"
          description={TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION}
        />
        <ul className={togstrekContinentHubSpecialTerritoriesGridClass}>
          {togstrekAsiaSpecialTerritories.map((t) => (
            <li key={t.href} className={togstrekContinentHubSpecialTerritoriesItemClass}>
              <TogstrekLinkCard
                variant="compact"
                href={t.href}
                title={t.label}
                meta={t.note}
                size="comfortable"
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
            const placeTail = togstrekPlacePathFromSegments(place);
            const href = buildTogstrekPlacePublicPath("antarctica", "antarctic", place);
            return (
              <li
                key={placeTail}
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
      <TogstrekContinentHubCountriesSection
        continent={continent}
        unCountries={un195ForContinent}
        travelData={travelData}
        regionPhrase={continent === "europe" ? "in Europe" : "in this region"}
        sectionHeadingId={
          continent === "europe"
            ? "togstrek-europe-countries-heading"
            : `togstrek-continent-hub-countries-heading-${continent}`
        }
        description={meta.countriesDescription}
      />
    );

  const beforeContent =
    continent === "europe" ? (
      <TogstrekFeaturedAdventure
        layout="panel"
        sectionAriaLabelledBy="togstrek-europe-adventure-heading"
      />
    ) : undefined;

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
      beforeContent={beforeContent}
      mapSection={mapSection}
      afterMap={afterMap}
      countriesSection={countriesSection}
    />
  );
}
