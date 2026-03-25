import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  togstrekAsiaSpecialTerritories,
  togstrekCountryHubPathByIso2,
} from "@/data/togstrek-country-hub-paths";
import {
  isTogstrekContinentHubRouteSlug,
  TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS,
  togstrekContinentHubPageMeta,
} from "@/data/togstrek-continent-hub-meta";
import { togstrekUn195Countries } from "@/data/togstrek-un195-countries";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

import { TogstrekContinentHubMapSection } from "./continent-hub-map-section";

type PageParams = { continent: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  return TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS.map((continent) => ({ continent }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent } = await params;
  if (!isTogstrekContinentHubRouteSlug(continent)) {
    return { title: "Not found" };
  }
  const meta = togstrekContinentHubPageMeta[continent];
  return buildTogstrekMetadata({
    title: meta.title,
    description: meta.description,
    path: meta.path,
    openGraphDescription: meta.description,
    openGraphImages: meta.openGraphImages,
  });
}

export default async function ContinentHubPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent } = await params;
  if (!isTogstrekContinentHubRouteSlug(continent)) {
    notFound();
  }

  const meta = togstrekContinentHubPageMeta[continent];
  const un195ForContinent = togstrekUn195Countries
    .filter((c) => c.continent === continent)
    .sort((a, b) => a.name.localeCompare(b.name));

  const hubCount = un195ForContinent.filter(
    (c) => togstrekCountryHubPathByIso2[c.iso2],
  ).length;

  const countriesDescriptionDefault = (
    <>
      All sovereign states in this region on the UN-style list of 195 (member
      states, observers, and Guinea-Bissau).{" "}
      <span className="text-tt-text-primary">
        {hubCount} of {un195ForContinent.length}
      </span>{" "}
      have a hub page so far; others stay on the list for coverage at a glance.
    </>
  );

  const countriesSectionDescription =
    meta.countriesDescription ?? countriesDescriptionDefault;

  const eyebrow =
    continent === "north-america"
      ? "North America"
      : continent === "south-america"
        ? "South America"
        : continent.charAt(0).toUpperCase() + continent.slice(1);

  return (
    <main className="togstrek-continent-hub w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekPageHero
        variant="landing"
        imageSrc={meta.heroImageSrc}
        imageAlt={meta.heroImageAlt}
        eyebrow={eyebrow}
        title={meta.title}
        titleId={`togstrek-continent-hub-title-${continent}`}
      />

      <TogstrekContentWidth className="py-[var(--tt-space-16)]">
        <section
          className="togstrek-continent-hub-map mt-[var(--tt-space-4)]"
          aria-labelledby={`togstrek-continent-hub-map-heading-${continent}`}
        >
          <TogstrekSectionHeader
            id={`togstrek-continent-hub-map-heading-${continent}`}
            title="On the map"
            description={`Live travel progress for ${eyebrow}: coverage against the UN country list, visited country and city counts, and an interactive map that switches between country and city views.`}
          />
          <div className="mt-[var(--tt-space-10)]">
            <TogstrekContinentHubMapSection lockedContinent={continent} />
          </div>
        </section>

        {continent === "asia" ? (
          <section
            className="togstrek-continent-hub-special-territories mt-[var(--tt-space-20)]"
            aria-labelledby="togstrek-asia-special-territories-heading"
          >
            <TogstrekSectionHeader
              id="togstrek-asia-special-territories-heading"
              title="Special territories"
              description="Places with their own story collections — not counted as separate countries on the UN list."
            />
            <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {togstrekAsiaSpecialTerritories.map((t) => (
                <li key={t.href}>
                  <TogstrekLinkCard
                    variant="compact"
                    href={t.href}
                    title={t.label}
                    meta={t.note}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="togstrek-continent-hub-countries mt-[var(--tt-space-20)]"
          aria-labelledby={`togstrek-continent-hub-countries-heading-${continent}`}
        >
          <TogstrekSectionHeader
            id={`togstrek-continent-hub-countries-heading-${continent}`}
            title="Countries"
            description={countriesSectionDescription}
          />
          {un195ForContinent.length > 0 ? (
            <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {un195ForContinent.map((c) => {
                const href = togstrekCountryHubPathByIso2[c.iso2];
                return (
                  <li key={c.iso2}>
                    <TogstrekLinkCard
                      variant="compact"
                      href={href}
                      title={c.name}
                    />
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>
      </TogstrekContentWidth>
    </main>
  );
}
