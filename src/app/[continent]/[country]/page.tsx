import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  TogstrekCountryHubTemplate,
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub/togstrek-country-hub-template";
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
    const fm = loadTogstrekPlaceFrontmatterOnly(continent, country, place);
    const href = `/${continent}/${country}/${place}`;
    cards.push({
      key: place,
      href,
      title: fm.title,
      description: truncateDescription(fm.description),
      imageSrc: fm.heroImage?.src,
      imageAlt: fm.heroImage?.alt,
    });
    if (typeof fm.lat === "number" && typeof fm.lng === "number") {
      mapPlaces.push({
        id: `${continent}-${country}-${place}`,
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
        title: "Places",
        description:
          "Open a story — photos, maps, and notes from each location.",
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
