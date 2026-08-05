import {
  TogstrekCountryHubTemplate,
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub/togstrek-country-hub-template";
import { TogstrekCountryHubMap } from "@/components/togstrek-place/togstrek-country-hub-map";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import type { TogstrekMapPlace } from "@/components/togstrek-explore-map/types";
import { resolveTogstrekCountryHubHeaderQuote } from "@/data/togstrek-country-hub-list-quotes";
import { formatSlugLabel, truncateDescription } from "@/lib/togstrek-geo-labels";
import {
  listPlaceSlugsForSwedenLan,
  TOGSTREK_SWEDEN_CONTINENT,
  TOGSTREK_SWEDEN_COUNTRY,
} from "@/lib/togstrek-sweden-lan";
import {
  loadTogstrekPlaceFrontmatterOnly,
  resolveTogstrekCountryHubHeaderHero,
} from "@/lib/togstrek-load-place-mdx";
import {
  buildTogstrekPlacePublicPath,
  togstrekPlacePathFromSegments,
} from "@/lib/togstrek-place-path";
import { getIso2ForCountrySlug } from "@/lib/togstrek-visited-travel-data";

type TogstrekSwedenLanHubContentProps = {
  lanSlug: string;
};

/**
 * Hub at `/europe/sweden/{lan}` — lists place stories under
 * `content/places/europe/sweden/{lan}/**` (Swedish counties, län).
 */
export function TogstrekSwedenLanHubContent({
  lanSlug,
}: TogstrekSwedenLanHubContentProps) {
  const continent = TOGSTREK_SWEDEN_CONTINENT;
  const country = TOGSTREK_SWEDEN_COUNTRY;
  const lanLabel = formatSlugLabel(lanSlug);
  const placeRows = listPlaceSlugsForSwedenLan(lanSlug);

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
  const headerHero = resolveTogstrekCountryHubHeaderHero(
    continent,
    country,
    placeRows,
  );
  const headerQuote = resolveTogstrekCountryHubHeaderQuote(iso2, lanLabel);

  return (
    <TogstrekCountryHubTemplate
      titleId="togstrek-sweden-lan-hub-title"
      continentLabel={continentLabel}
      countryLabel={lanLabel}
      lead={
        <>
          Place stories in {lanLabel} ({countryLabel}).
        </>
      }
      headerHero={headerHero}
      headerQuote={headerQuote}
      breadcrumbItems={[
        { href: `/${continent}`, label: continentLabel },
        {
          href: buildTogstrekPlacePublicPath(continent, country, []),
          label: countryLabel,
        },
        { label: lanLabel },
      ]}
      map={{
        title: "Map",
        description: "Each pin marks a place with a story — click through to read it.",
        mapHeadingId: "togstrek-sweden-lan-hub-map-heading",
        children: (
          <TogstrekCountryHubMap
            places={mapPlaces}
            visitedCountryIso2={visitedCountryIso2}
            countryLabel={lanLabel}
          />
        ),
      }}
      places={{
        title: "Places",
        description:
          "Open a story to find out about a place — its photos, recommendations, and impressions.",
        placesHeadingId: "togstrek-sweden-lan-hub-places-heading",
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
