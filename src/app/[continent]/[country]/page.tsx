import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  TogstrekCountryHubTemplate,
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub/togstrek-country-hub-template";
import { TogstrekUkNationsStrip } from "@/components/togstrek-hub/togstrek-uk-nations-strip";
import { TogstrekSwedenLanStrip } from "@/components/togstrek-hub/togstrek-sweden-lan-strip";
import { TogstrekUnitedStatesStatesStrip } from "@/components/togstrek-hub/togstrek-united-states-states-strip";
import { TogstrekCountryHubMap } from "@/components/togstrek-place/togstrek-country-hub-map";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import type { TogstrekMapPlace } from "@/components/togstrek-explore-map/types";
import {
  formatSlugLabel,
  truncateDescription,
} from "@/lib/togstrek-geo-labels";
import { getTogstrekCountryHubIntro } from "@/data/togstrek-country-hub-intro";
import { resolveTogstrekCountryHubHeaderQuote } from "@/data/togstrek-country-hub-list-quotes";
import {
  buildTogstrekDefaultOpenGraphTitle,
  buildTogstrekMetadata,
  TOGSTREK_OG_IMAGE_HEIGHT,
  TOGSTREK_OG_IMAGE_WIDTH,
} from "@/lib/togstrek-metadata";
import {
  discoverTogstrekCountryHubParams,
  discoverTogstrekPlaceSlugs,
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
  togstrekPlaceMdxExists,
  resolveTogstrekCountryHubHeaderHero,
} from "@/lib/togstrek-load-place-mdx";
import {
  TogstrekPlaceAppRoute,
  generateTogstrekPlaceRouteMetadata,
} from "@/lib/togstrek-place-app-route";
import {
  TOGSTREK_ANTARCTICA_COUNTRY_SLUG,
  buildTogstrekPlacePublicPath,
  togstrekPlacePathFromSegments,
} from "@/lib/togstrek-place-path";
import {
  TOGSTREK_UNITED_STATES_CONTINENT,
  TOGSTREK_UNITED_STATES_COUNTRY,
} from "@/lib/togstrek-united-states-state-hubs";
import { getIso2ForCountrySlug } from "@/lib/togstrek-visited-travel-data";

type PageParams = { continent: string; country: string };

/** Only prebuilt country hubs from MDX discovery. */
export const dynamicParams = false;

function dedupeAntarcticCountryPageParams(
  raw: { continent: string; country: string }[],
): PageParams[] {
  const m = new Map<string, { continent: string; country: string }>();
  for (const p of raw) m.set(`${p.continent}\0${p.country}`, p);
  return [...m.values()];
}

export async function generateStaticParams(): Promise<PageParams[]> {
  const fromHubs = discoverTogstrekCountryHubParams();
  const antarcticDirectPlaces: PageParams[] = discoverTogstrekPlaceSlugs()
    .filter(
      (s) =>
        s.continent === "antarctica" &&
        s.country === TOGSTREK_ANTARCTICA_COUNTRY_SLUG &&
        s.place.length === 1,
    )
    .map((s) => ({
      continent: "antarctica",
      country: s.place[0]!,
    }));
  return dedupeAntarcticCountryPageParams([...fromHubs, ...antarcticDirectPlaces]);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent, country } = await params;
  if (
    continent === "antarctica" &&
    togstrekPlaceMdxExists(continent, TOGSTREK_ANTARCTICA_COUNTRY_SLUG, [country])
  ) {
    return generateTogstrekPlaceRouteMetadata(continent, TOGSTREK_ANTARCTICA_COUNTRY_SLUG, [
      country,
    ]);
  }
  const places = listTogstrekPlaceSlugsForCountry(continent, country);
  if (places.length === 0) {
    return { title: "Country" };
  }
  const countryLabel = formatSlugLabel(country);
  const path = buildTogstrekPlacePublicPath(continent, country, []);
  const headerHero = resolveTogstrekCountryHubHeaderHero(continent, country);

  const placeTitles = places.slice(0, 5).map(({ place }) =>
    loadTogstrekPlaceFrontmatterOnly(continent, country, place).title,
  );
  const listed = placeTitles.slice(0, 3).join(", ");
  const moreCount = places.length - 3;
  const morePhrase =
    moreCount <= 0
      ? ""
      : moreCount === 1
        ? " — plus one more place"
        : ` — plus ${moreCount} more places`;
  const description = truncateDescription(
    places.length === 1
      ? `${countryLabel} travel guide: ${listed}. Photos, maps, and field notes for planning a visit.`
      : `${countryLabel} travel guides covering ${listed}${morePhrase}. Photos, maps, and on-the-ground notes for each place.`,
    165,
  );
  const ogDescription = truncateDescription(
    `${countryLabel}: ${listed}${places.length > 3 ? ` and ${places.length - 3} more` : ""}. Practical place guides with photography.`,
    200,
  );

  return buildTogstrekMetadata({
    title: countryLabel,
    description,
    path,
    type: "website",
    openGraphTitle: buildTogstrekDefaultOpenGraphTitle(countryLabel),
    openGraphDescription: ogDescription,
    openGraphImages: [
      {
        url: headerHero.src,
        width: TOGSTREK_OG_IMAGE_WIDTH,
        height: TOGSTREK_OG_IMAGE_HEIGHT,
        alt: headerHero.alt,
      },
    ],
  });
}

export default async function TogstrekCountryHubPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent, country } = await params;
  if (
    continent === "antarctica" &&
    togstrekPlaceMdxExists(continent, TOGSTREK_ANTARCTICA_COUNTRY_SLUG, [country])
  ) {
    return (
      <TogstrekPlaceAppRoute
        continent={continent}
        country={TOGSTREK_ANTARCTICA_COUNTRY_SLUG}
        place={[country]}
      />
    );
  }
  const placeRows = listTogstrekPlaceSlugsForCountry(continent, country);
  if (placeRows.length === 0) {
    notFound();
  }

  const isUnitedKingdom = country === "united-kingdom";
  const isUnitedStatesHub =
    continent === TOGSTREK_UNITED_STATES_CONTINENT &&
    country === TOGSTREK_UNITED_STATES_COUNTRY;
  const isSwedenHub = continent === "europe" && country === "sweden";

  // If a country has nested place pages (e.g. `svalbard/longyearbyen`) and also a
  // top-level hub at the parent segment (e.g. `svalbard`), prefer the hub card
  // and hide its children from the country grid to avoid duplicate clutter.
  const topLevelHubs = new Set(
    placeRows.filter((r) => r.place.length === 1).map((r) => r.place[0]!),
  );

  const continentLabel = formatSlugLabel(continent);
  const countryLabel = formatSlugLabel(country);

  const mapPlaces: TogstrekMapPlace[] = [];
  const cards: {
    key: string;
    href: string;
    title: string;
    description: string;
    imageSrc?: string;
    imageAlt?: string;
  }[] = [];

  for (const { place } of placeRows) {
    if (!isUnitedKingdom && place.length > 1 && topLevelHubs.has(place[0]!)) {
      continue;
    }
    const fm = loadTogstrekPlaceFrontmatterOnly(continent, country, place);
    const placeTail = togstrekPlacePathFromSegments(place);
    const href = buildTogstrekPlacePublicPath(continent, country, place);
    cards.push({
      key: placeTail,
      href,
      title: fm.title,
      description: truncateDescription(fm.description),
      imageSrc: fm.heroImage?.src,
      imageAlt: fm.heroImage?.alt,
    });
    if (typeof fm.lat === "number" && typeof fm.lng === "number") {
      mapPlaces.push({
        id: `${continent}-${country}-${placeTail.replace(/\//g, "-")}`,
        href,
        title: fm.title,
        excerpt: fm.description,
        longitude: fm.lng,
        latitude: fm.lat,
        thumbnailSrc: fm.heroImage?.src,
        thumbnailAlt: fm.heroImage?.alt,
      });
    }
  }

  const iso2 = getIso2ForCountrySlug(continent, country);
  const visitedCountryIso2 = iso2 ? [iso2] : undefined;
  const headerHero = resolveTogstrekCountryHubHeaderHero(continent, country);
  const headerQuote = resolveTogstrekCountryHubHeaderQuote(iso2, countryLabel);
  const intro = getTogstrekCountryHubIntro(continent, country);

  return (
    <TogstrekCountryHubTemplate
      titleId="togstrek-country-hub-title"
      continentLabel={continentLabel}
      countryLabel={countryLabel}
      lead={
        <>
          Place stories in {countryLabel} ({continentLabel}).
        </>
      }
      headerHero={headerHero}
      headerQuote={headerQuote}
      intro={intro}
      breadcrumbItems={[
        { href: `/${continent}`, label: continentLabel },
        { label: countryLabel },
      ]}
      beforeMapSlot={
        isUnitedKingdom ? (
          <TogstrekUkNationsStrip />
        ) : isUnitedStatesHub ? (
          <TogstrekUnitedStatesStatesStrip />
        ) : isSwedenHub ? (
          <TogstrekSwedenLanStrip />
        ) : undefined
      }
      map={{
        title: "Map",
        description:
          "Each pin in the map shows a place visited and a story told.",
        mapHeadingId: "togstrek-country-hub-map-heading",
        children: (
          <TogstrekCountryHubMap
            places={mapPlaces}
            visitedCountryIso2={visitedCountryIso2}
            countryLabel={countryLabel}
          />
        ),
      }}
      places={{
        title:
          isUnitedKingdom || isUnitedStatesHub || isSwedenHub
            ? "All places"
            : "Places",
        description:
          isUnitedKingdom || isUnitedStatesHub || isSwedenHub
            ? "Every place story in this country — open a card for photos, maps, and notes."
            : "Open a story, find out about a place, its photos, recommendations and impresions.",
        placesHeadingId: "togstrek-country-hub-places-heading",
        children: (
          <>
            {cards.map((c) => (
              <li
                key={c.key}
                className="togstrek-country-hub-places-item min-h-[var(--tt-region-card-min-height)] min-w-0"
              >
                <TogstrekLinkCard
                  variant="region"
                  href={c.href}
                  title={c.title}
                  description={c.description}
                  gradient={TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK}
                  imageSrc={c.imageSrc}
                  imageAlt={c.imageAlt}
                />
              </li>
            ))}
          </>
        ),
      }}
    />
  );
}
