import {
  TogstrekCountryHubTemplate,
  TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK,
} from "@/components/togstrek-hub/togstrek-country-hub-template";
import { TogstrekCountryHubMap } from "@/components/togstrek-place/togstrek-country-hub-map";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import type { TogstrekMapPlace } from "@/components/togstrek-explore-map/types";
import { resolveTogstrekCountryHubHeaderQuote } from "@/data/togstrek-country-hub-list-quotes";
import { formatSlugLabel, truncateDescription } from "@/lib/togstrek-geo-labels";
import { listPlaceSlugsForEnglandCounty } from "@/lib/togstrek-england-counties";
import {
  loadTogstrekPlaceFrontmatterOnly,
  resolveTogstrekCountryHubHeaderHero,
} from "@/lib/togstrek-load-place-mdx";
import {
  buildTogstrekPlacePublicPath,
  togstrekPlacePathFromSegments,
} from "@/lib/togstrek-place-path";
import { getUkNationLabel } from "@/lib/togstrek-uk-nations";
import { getIso2ForCountrySlug } from "@/lib/togstrek-visited-travel-data";

type TogstrekEnglandCountyHubContentProps = {
  countySlug: string;
};

/**
 * Hub at `/europe/united-kingdom/england/{county}` — lists place stories under
 * `content/.../england/{county}/**`.
 */
export function TogstrekEnglandCountyHubContent({
  countySlug,
}: TogstrekEnglandCountyHubContentProps) {
  const continent = "europe";
  const country = "united-kingdom";
  const countyLabel = formatSlugLabel(countySlug);
  const placeRows = listPlaceSlugsForEnglandCounty(countySlug);

  const continentLabel = formatSlugLabel(continent);
  const countryLabel = formatSlugLabel(country);
  const englandLabel = getUkNationLabel("england");

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
  const headerQuote = resolveTogstrekCountryHubHeaderQuote(iso2, countyLabel);

  return (
    <TogstrekCountryHubTemplate
      titleId="togstrek-england-county-hub-title"
      continentLabel={continentLabel}
      countryLabel={countyLabel}
      lead={
        <>
          Place stories in {countyLabel} ({englandLabel}).
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
        {
          href: buildTogstrekPlacePublicPath(continent, country, ["england"]),
          label: englandLabel,
        },
        { label: countyLabel },
      ]}
      map={{
        title: "Map",
        description:
          "Each pin sits where that place’s story is anchored — the latitude and longitude saved with the write-up.",
        mapHeadingId: "togstrek-england-county-hub-map-heading",
        children: (
          <TogstrekCountryHubMap
            places={mapPlaces}
            visitedCountryIso2={visitedCountryIso2}
            countryLabel={countyLabel}
          />
        ),
      }}
      places={{
        title: "Places",
        description:
          "Open a story — photos, maps, and notes from each location.",
        placesHeadingId: "togstrek-england-county-hub-places-heading",
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
