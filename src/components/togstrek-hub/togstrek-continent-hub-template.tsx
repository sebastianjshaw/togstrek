import type { ReactNode } from "react";

import {
  TogstrekPageHero,
  type TogstrekPageHeroQuote,
} from "@/components/togstrek-page-hero";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";

export type TogstrekContinentHubHeroProps = {
  eyebrow: string;
  title: string;
  titleId: string;
  imageSrc: string;
  imageAlt: string;
  /** Optional pull quote — unique per continent (see `continentHubHeroQuoteForSlug`). */
  quote?: TogstrekPageHeroQuote;
};

export type TogstrekContinentHubTemplateProps = {
  hero: TogstrekContinentHubHeroProps;
  /** Optional block at top of content (e.g. Europe featured adventure). */
  beforeContent?: ReactNode;
  /** “On the map” block (header + dashboard). */
  mapSection: ReactNode;
  /** Optional block between map and countries (e.g. Asia special territories). */
  afterMap?: ReactNode;
  /** “Countries” block (header + grid). Omit for hubs with no country list (e.g. Antarctica). */
  countriesSection?: ReactNode;
};

/**
 * Shell for continent hub routes: landing hero + padded content column with
 * map, optional insert, then countries.
 */
export function TogstrekContinentHubTemplate({
  hero,
  beforeContent,
  mapSection,
  afterMap,
  countriesSection,
}: TogstrekContinentHubTemplateProps) {
  return (
    <main className="togstrek-continent-hub w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekPageHero
        variant="landing"
        imageSrc={hero.imageSrc}
        imageAlt={hero.imageAlt}
        eyebrow={hero.eyebrow}
        title={hero.title}
        titleId={hero.titleId}
        quote={hero.quote}
      />

      <TogstrekContentWidth className="py-[var(--tt-space-16)]">
        {beforeContent}
        {mapSection}
        {afterMap}
        {countriesSection}
      </TogstrekContentWidth>
    </main>
  );
}
