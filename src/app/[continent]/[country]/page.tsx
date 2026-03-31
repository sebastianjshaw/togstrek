import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  TogstrekCountryHubTemplate,
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub/togstrek-country-hub-template";
import { TogstrekUkNationsStrip } from "@/components/togstrek-hub/togstrek-uk-nations-strip";
import { TogstrekCountryHubMap } from "@/components/togstrek-place/togstrek-country-hub-map";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import type { TogstrekMapPlace } from "@/components/togstrek-explore-map/types";
import {
  formatSlugLabel,
  truncateDescription,
} from "@/lib/togstrek-geo-labels";
import { togstrekCountryHubHeaderQuoteByIso2 } from "@/data/togstrek-country-hub-list-quotes";
import {
  buildTogstrekDefaultOpenGraphTitle,
  buildTogstrekMetadata,
} from "@/lib/togstrek-metadata";
import {
  discoverTogstrekCountryHubParams,
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
} from "@/lib/togstrek-load-place-mdx";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import { getIso2ForCountrySlug } from "@/lib/togstrek-visited-travel-data";

type PageParams = { continent: string; country: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  return discoverTogstrekCountryHubParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent, country } = await params;
  const places = listTogstrekPlaceSlugsForCountry(continent, country);
  if (places.length === 0) {
    return { title: "Country" };
  }
  const countryLabel = formatSlugLabel(country);
  const path = `/${continent}/${country}`;

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
  });
}

export default async function TogstrekCountryHubPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent, country } = await params;
  const placeRows = listTogstrekPlaceSlugsForCountry(continent, country);
  if (placeRows.length === 0) {
    notFound();
  }

  const isUnitedKingdom = country === "united-kingdom";

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
    const href = `/${continent}/${country}/${placeTail}`;
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
  const headerQuote =
    iso2 !== undefined
      ? togstrekCountryHubHeaderQuoteByIso2[iso2]
      : undefined;

  return (
    <TogstrekCountryHubTemplate
      titleId="togstrek-country-hub-title"
      countryLabel={countryLabel}
      lead={
        <>
          Place stories in {countryLabel} ({continentLabel}).
        </>
      }
      headerQuote={headerQuote}
      breadcrumbItems={[
        { href: `/${continent}`, label: continentLabel },
        { label: countryLabel },
      ]}
      beforeMapSlot={isUnitedKingdom ? <TogstrekUkNationsStrip /> : undefined}
      map={{
        title: "Map",
        description:
          "Each pin sits where that place’s story is anchored — the latitude and longitude saved with the write-up.",
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
        title: isUnitedKingdom ? "All places" : "Places",
        description: isUnitedKingdom
          ? "Every place story in the United Kingdom — open a card for photos, maps, and notes."
          : "Open a story — photos, maps, and notes from each location.",
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
