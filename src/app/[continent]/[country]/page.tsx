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
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
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
  return buildTogstrekMetadata({
    title: countryLabel,
    description: `Place stories and photos from ${countryLabel} on Tog's Trek.`,
    path,
    type: "website",
    openGraphTitle: `${countryLabel} — A Tog's Trek`,
    openGraphDescription: `Stories from ${countryLabel}.`,
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

  return (
    <TogstrekCountryHubTemplate
      titleId="togstrek-country-hub-title"
      countryLabel={countryLabel}
      lead={
        <>
          Place stories in {countryLabel} ({continentLabel}).
        </>
      }
      breadcrumbItems={[
        { href: `/${continent}`, label: continentLabel },
        { label: countryLabel },
      ]}
      map={{
        title: "Map",
        description: "Pins use coordinates from each place’s frontmatter.",
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
