import type { ReactNode } from "react";

import type { TogstrekBreadcrumbItem } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";

/** Default gradient when a place has no hero image on country hub cards. */
export const TOGSTREK_COUNTRY_HUB_PLACE_CARD_GRADIENT_FALLBACK =
  "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30";

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
  countryLabel: string;
  /** Short line under the H1 (e.g. “Place stories in …”). */
  lead: ReactNode;
  /** Optional pull-quote under the lead (e.g. attributed line for select countries). */
  headerQuote?: { body: string; attribution: string };
  breadcrumbItems: TogstrekBreadcrumbItem[];
  map: TogstrekCountryHubMapSlotProps;
  places: TogstrekCountryHubPlacesSlotProps;
};

const PLACE_CARD_GRID_CLASS =
  "mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3";

/**
 * Shell for `/{continent}/{country}`: title header, breadcrumb, map section, place cards.
 */
export function TogstrekCountryHubTemplate({
  titleId,
  countryLabel,
  lead,
  headerQuote,
  breadcrumbItems,
  map,
  places,
}: TogstrekCountryHubTemplateProps) {
  return (
    <main className="togstrek-country-hub-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <header className="togstrek-country-hub-header border-b border-tt-border-muted bg-tt-surface-muted">
        <TogstrekContentWidth className="py-[var(--tt-space-12)]">
          <TogstrekPageTitle id={titleId}>{countryLabel}</TogstrekPageTitle>
          <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            {lead}
          </p>
          {headerQuote ? (
            <figure className="togstrek-country-hub-header-quote mt-[var(--tt-space-8)] max-w-[min(36rem,100%)]">
              <blockquote className="font-tt-display text-[clamp(1.05rem,1.5vw+0.5rem,1.35rem)] font-semibold leading-[var(--tt-leading-snug)] text-tt-text-primary [overflow-wrap:anywhere]">
                {headerQuote.body}
              </blockquote>
              <figcaption className="mt-[var(--tt-space-3)] font-tt-body text-[length:var(--tt-text-small)] italic text-tt-text-secondary">
                — {headerQuote.attribution}
              </figcaption>
            </figure>
          ) : null}
        </TogstrekContentWidth>
      </header>

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        <section
          className="togstrek-country-hub-map-section mt-[var(--tt-space-10)]"
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
