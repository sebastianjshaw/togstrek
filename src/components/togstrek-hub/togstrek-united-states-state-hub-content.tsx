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
  listPlaceSlugsForUnitedStatesState,
  TOGSTREK_UNITED_STATES_CONTINENT,
  TOGSTREK_UNITED_STATES_COUNTRY,
} from "@/lib/togstrek-united-states-state-hubs";
import {
  loadTogstrekPlaceFrontmatterOnly,
  resolveTogstrekCountryHubHeaderHero,
} from "@/lib/togstrek-load-place-mdx";
import {
  buildTogstrekPlacePublicPath,
  togstrekPlacePathFromSegments,
} from "@/lib/togstrek-place-path";
import { getIso2ForCountrySlug } from "@/lib/togstrek-visited-travel-data";

type TogstrekUnitedStatesStateHubContentProps = {
  stateSlug: string;
};

/**
 * Hub at `/north-america/united-states-of-america/{state}` — lists place stories under
 * `content/.../united-states-of-america/{state}/**`.
 */
export function TogstrekUnitedStatesStateHubContent({
  stateSlug,
}: TogstrekUnitedStatesStateHubContentProps) {
  const continent = TOGSTREK_UNITED_STATES_CONTINENT;
  const country = TOGSTREK_UNITED_STATES_COUNTRY;
  const stateLabel = formatSlugLabel(stateSlug);
  const placeRows = listPlaceSlugsForUnitedStatesState(stateSlug);

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
  const headerQuote = resolveTogstrekCountryHubHeaderQuote(iso2, stateLabel);

  return (
    <TogstrekCountryHubTemplate
      titleId="togstrek-united-states-state-hub-title"
      continentLabel={continentLabel}
      countryLabel={stateLabel}
      lead={
        <>
          Place stories in {stateLabel} ({countryLabel}).
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
        { label: stateLabel },
      ]}
      map={{
        title: "Map",
        description:
          "Each pin in the map shows a place visited and a story told.",
        mapHeadingId: "togstrek-united-states-state-hub-map-heading",
        children: (
          <TogstrekCountryHubMap
            places={mapPlaces}
            visitedCountryIso2={visitedCountryIso2}
            countryLabel={stateLabel}
          />
        ),
      }}
      places={{
        title: "Places",
        description:
          "Open a story, find out about a place, its photos, recommendations and impresions from each place.",
        placesHeadingId: "togstrek-united-states-state-hub-places-heading",
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
