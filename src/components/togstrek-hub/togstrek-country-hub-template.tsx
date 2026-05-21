import type { ReactNode } from "react";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import {
  TogstrekBreadcrumb,
  type TogstrekBreadcrumbItem,
} from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import type { TogstrekCountryHubHeaderQuote } from "@/data/togstrek-country-hub-list-quotes";
import { togstrekMainLandmarkProps } from "@/lib/togstrek-main-landmark";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";

import type { TogstrekCardGradientId } from "@/data/togstrek-card-gradients";

/** Default gradient when a place has no hero image on country hub cards. */
export const TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK: TogstrekCardGradientId =
  "hubPlaceFallback";

export type TogstrekCountryHubMapSlotProps = {
  title: string;
  description: string;
  mapHeadingId: string;
  children: ReactNode;
};

export type TogstrekCountryHubPlacesSlotProps = {
  title: string;
  description: string;
  placesHeadingId: string;
  children: ReactNode;
};

export type TogstrekCountryHubTemplateProps = {
  titleId: string;
  /** Continent label for the hero eyebrow (e.g. “Europe”). */
  continentLabel: string;
  countryLabel: string;
  /** Short line under the H1 inside the hero (e.g. “Place stories in …”). */
  lead: ReactNode;
  /** Full-bleed header image (first place hero or continent fallback). */
  headerHero: { src: string; alt: string };
  /** Pull-quote on the hero (resolved so body is always set). */
  headerQuote: TogstrekCountryHubHeaderQuote;
  breadcrumbItems: TogstrekBreadcrumbItem[];
  /** Optional long-form country essay after the breadcrumb (e.g. Egypt hub). */
  intro?: ReactNode;
  /** Optional block after intro / breadcrumb, before the map (e.g. UK nation cards). */
  beforeMapSlot?: ReactNode;
  map: TogstrekCountryHubMapSlotProps;
  places: TogstrekCountryHubPlacesSlotProps;
};

const PLACE_CARD_GRID_CLASS =
  "mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

/**
 * Shell for `/{continent}/{country}`: cinematic hero (image + quote), breadcrumb, map, place cards.
 */
export function TogstrekCountryHubTemplate({
  titleId,
  continentLabel,
  countryLabel,
  lead,
  headerHero,
  headerQuote,
  breadcrumbItems,
  intro,
  beforeMapSlot,
  map,
  places,
}: TogstrekCountryHubTemplateProps) {
  return (
    <main
      {...togstrekMainLandmarkProps}
      className="togstrek-country-hub-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]"
    >
      <TogstrekPageHero
        variant="landing"
        imageSrc={headerHero.src}
        imageAlt={headerHero.alt}
        eyebrow={continentLabel}
        title={countryLabel}
        titleId={titleId}
        quote={{
          children: headerQuote.body,
          attribution: headerQuote.attribution,
        }}
        lead={lead}
      />

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        {intro ? (
          <section
            className="togstrek-country-hub-intro-section mt-[var(--tt-space-10)] max-w-[var(--tt-layout-max-prose)]"
            aria-label={`About ${countryLabel}`}
          >
            {intro}
          </section>
        ) : null}

        {beforeMapSlot ? (
          <div
            className={`togstrek-country-hub-before-map ${intro ? "mt-[var(--tt-space-12)]" : "mt-[var(--tt-space-10)]"}`}
          >
            {beforeMapSlot}
          </div>
        ) : null}

        <section
          className={`togstrek-country-hub-map-section ${beforeMapSlot ? "mt-[var(--tt-space-16)]" : intro ? "mt-[var(--tt-space-12)]" : "mt-[var(--tt-space-10)]"}`}
          aria-labelledby={map.mapHeadingId}
        >
          <TogstrekSectionHeader
            id={map.mapHeadingId}
            title={map.title}
            description={map.description}
          />
          <div className="mt-[var(--tt-space-10)]">{map.children}</div>
        </section>

        <section
          className="togstrek-country-hub-places mt-[var(--tt-space-20)]"
          aria-labelledby={places.placesHeadingId}
        >
          <TogstrekSectionHeader
            id={places.placesHeadingId}
            title={places.title}
            description={places.description}
          />
          <ul className={`togstrek-country-hub-places-grid ${PLACE_CARD_GRID_CLASS}`}>
            {places.children}
          </ul>
        </section>
      </TogstrekContentWidth>
    </main>
  );
}
