import type { ReactNode } from "react";

import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import { togstrekCountryHubPathByIso2 } from "@/data/togstrek-country-hub-paths";
import { getTogstrekCountryHubTileQuote } from "@/data/togstrek-country-hub-list-quotes";
import type { TogstrekUn195Country } from "@/data/togstrek-un195-countries";
import {
  TogstrekHubCountriesListIntro,
  TogstrekHubCountriesPrioritizedLayoutHint,
} from "@/lib/togstrek-hub-section-copy";
import { pickTogstrekCountryHubTileHeroFromPlaces } from "@/lib/togstrek-load-place-mdx";
import type { TogstrekVisitedTravelDataset } from "@/lib/togstrek-visited-travel-data";

const togstrekContinentHubCountriesGridClass =
  "togstrek-continent-hub-countries-grid grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:grid-cols-3";

function togstrekContinentHubCountryListItems(
  continent: string,
  rows: { c: TogstrekUn195Country; href?: string }[],
) {
  return rows.map(({ c, href }) => {
    const quote = getTogstrekCountryHubTileQuote(c.iso2);
    const tileHero = pickTogstrekCountryHubTileHeroFromPlaces({
      continentSlug: continent,
      unCountryName: c.name,
      hubHref: href,
    });
    return (
      <li
        key={c.iso2}
        className="togstrek-continent-hub-countries-item flex min-h-0 min-w-0 flex-col"
      >
        <TogstrekLinkCard
          variant="compact"
          href={href}
          title={c.name}
          quote={quote}
          size="comfortable"
          imageSrc={tileHero?.src}
          imageAlt={tileHero?.alt}
        />
      </li>
    );
  });
}

export type TogstrekContinentHubCountriesSectionProps = {
  continent: string;
  unCountries: TogstrekUn195Country[];
  travelData: TogstrekVisitedTravelDataset;
  regionPhrase: "in Europe" | "in this region";
  sectionHeadingId: string;
  /** When set, replaces the default intro + optional prioritized hint. */
  description?: ReactNode;
};

/**
 * UN country grid for continent hubs — shared by `/europe` and `/[continent]`.
 * Low-coverage regions: “Hubs & place stories” first, then a disclosure with
 * the full A–Z list (including countries that already have guides).
 */
export function TogstrekContinentHubCountriesSection({
  continent,
  unCountries,
  travelData,
  regionPhrase,
  sectionHeadingId,
  description: descriptionOverride,
}: TogstrekContinentHubCountriesSectionProps) {
  const continentCountryRows = unCountries.map((c) => ({
    c,
    href:
      togstrekCountryHubPathByIso2[c.iso2] ??
      travelData.countryStoryHrefByIso2[c.iso2],
  }));

  const withStoryCountries = continentCountryRows
    .filter((r): r is { c: TogstrekUn195Country; href: string } => Boolean(r.href))
    .sort((a, b) => a.c.name.localeCompare(b.c.name));

  const withoutStoryCountries = continentCountryRows
    .filter((r) => !r.href)
    .sort((a, b) => a.c.name.localeCompare(b.c.name));

  const allContinentCountriesAlphabetical = [...continentCountryRows].sort(
    (a, b) => a.c.name.localeCompare(b.c.name),
  );

  const publishedCountryCount = withStoryCountries.length;
  const usePrioritizedCountriesLayout =
    withStoryCountries.length >= 1 && withoutStoryCountries.length >= 8;

  const defaultDescription = (
    <>
      <TogstrekHubCountriesListIntro
        regionPhrase={regionPhrase}
        hubCount={publishedCountryCount}
        total={unCountries.length}
      />
      {usePrioritizedCountriesLayout ? (
        <TogstrekHubCountriesPrioritizedLayoutHint
          missingCount={withoutStoryCountries.length}
        />
      ) : null}
    </>
  );

  const sectionDescription = descriptionOverride ?? defaultDescription;

  if (unCountries.length === 0) {
    return (
      <section
        className="togstrek-continent-hub-countries mt-[var(--tt-space-20)]"
        aria-labelledby={sectionHeadingId}
      >
        <TogstrekSectionHeader
          id={sectionHeadingId}
          title="Countries"
          description={sectionDescription}
        />
      </section>
    );
  }

  return (
    <section
      className="togstrek-continent-hub-countries mt-[var(--tt-space-20)]"
      aria-labelledby={sectionHeadingId}
    >
      <TogstrekSectionHeader
        id={sectionHeadingId}
        title="Countries"
        description={sectionDescription}
      />
      {usePrioritizedCountriesLayout ? (
        <div className="togstrek-continent-hub-countries-prioritized-layout">
          <div className="togstrek-continent-hub-countries-published mt-[var(--tt-space-10)]">
            <h3
              id={`togstrek-continent-hub-countries-published-heading-${continent}`}
              className="font-tt-display text-[length:var(--tt-text-title)] font-bold tracking-[var(--tt-tracking-tight)] text-tt-text-primary"
            >
              Hubs & place stories
            </h3>
            <ul
              className={`${togstrekContinentHubCountriesGridClass} mt-[var(--tt-space-6)]`}
            >
              {togstrekContinentHubCountryListItems(
                continent,
                withStoryCountries,
              )}
            </ul>
          </div>
          <details className="togstrek-continent-hub-countries-roll-call-details mt-[var(--tt-space-12)] border-t border-tt-border-muted pt-[var(--tt-space-10)]">
            <summary className="togstrek-continent-hub-countries-roll-call-summary cursor-pointer list-none font-tt-display text-[length:var(--tt-text-body)] font-semibold text-tt-text-primary [&::-webkit-details-marker]:hidden">
              Open full list of countries
            </summary>
            <p
              id={`togstrek-continent-hub-countries-roll-call-subheading-${continent}`}
              className="togstrek-continent-hub-countries-roll-call-missing-count mt-[var(--tt-space-4)] font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-secondary"
            >
              {withoutStoryCountries.length} without a guide
            </p>
            <p className="mt-[var(--tt-space-3)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary">
              Every sovereign state in this region on the UN list — same as the
              map totals — with links where a hub or place page exists.
            </p>
            <ul
              className={`${togstrekContinentHubCountriesGridClass} mt-[var(--tt-space-6)]`}
            >
              {togstrekContinentHubCountryListItems(
                continent,
                allContinentCountriesAlphabetical,
              )}
            </ul>
          </details>
        </div>
      ) : (
        <ul
          className={`${togstrekContinentHubCountriesGridClass} mt-[var(--tt-space-10)]`}
        >
          {togstrekContinentHubCountryListItems(continent, [
            ...withStoryCountries,
            ...withoutStoryCountries,
          ])}
        </ul>
      )}
    </section>
  );
}
