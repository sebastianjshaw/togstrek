import {
  togstrekContinentNavMegaItems,
  type TogstrekNavMegaContinentId,
} from "@/data/togstrek-continent-nav-mega-items";
import { findTogstrekAdventureArchiveItemByHref } from "@/lib/togstrek-adventure-content-fs";
import {
  type TogstrekUnContinentId,
  togstrekUn195Countries,
} from "@/data/togstrek-un195-countries";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import {
  discoverTogstrekCountryHubParams,
  listTogstrekPlaceSlugsForCountry,
  loadTogstrekPlaceFrontmatterOnly,
} from "@/lib/togstrek-place-mdx-fs";
import { buildTogstrekPlacePublicPath } from "@/lib/togstrek-place-path";
import { getIso2ForCountrySlug } from "@/lib/togstrek-visited-travel-data";

/** Optional display names when the site label differs from UN/common English. */
const hubMenuDisplayNameByIso2: Partial<Record<string, string>> = {
  CZ: "Czech Republic",
};

/**
 * Country hubs that appear under an extra continent in the nav mega menu only.
 * Canonical URLs and MDX stay in one folder (e.g. `/europe/turkiye`).
 */
const togstrekMegaMenuCrossListedCountryHubs: Partial<
  Record<TogstrekUnContinentId, readonly { href: string; label: string }[]>
> = {
  asia: [{ href: "/europe/turkiye", label: "Türkiye" }],
};

function countryLabelForContinentMegaMenu(
  continent: string,
  countrySlug: string,
): string {
  const iso2 = getIso2ForCountrySlug(continent, countrySlug);
  if (iso2) {
    const row = togstrekUn195Countries.find((c) => c.iso2 === iso2);
    if (row) {
      return hubMenuDisplayNameByIso2[iso2] ?? row.name;
    }
  }
  return formatSlugLabel(countrySlug);
}

/**
 * Mega menu links: every country hub and Antarctic place that has MDX under
 * `content/places/…`. Antarctic place URLs are flat: `/antarctica/<place>`.
 */
export function getTogstrekContinentMegaMenuLinks(
  continentId: TogstrekUnContinentId,
): { href: string; label: string }[] {
  if (continentId === "antarctica") {
    const rows = listTogstrekPlaceSlugsForCountry("antarctica", "antarctic");
    return rows
      .map(({ place }) => {
        const fm = loadTogstrekPlaceFrontmatterOnly(
          "antarctica",
          "antarctic",
          place,
        );
        return {
          href: buildTogstrekPlacePublicPath("antarctica", "antarctic", place),
          label: fm.title,
        };
      })
      .sort((a, b) =>
        a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
      );
  }

  const byHref = new Map<string, string>();

  for (const { continent, country } of discoverTogstrekCountryHubParams()) {
    if (continent !== continentId) continue;
    const href = buildTogstrekPlacePublicPath(continent, country, []);
    byHref.set(href, countryLabelForContinentMegaMenu(continent, country));
  }

  for (const row of togstrekMegaMenuCrossListedCountryHubs[continentId] ?? []) {
    if (!byHref.has(row.href)) {
      byHref.set(row.href, row.label);
    }
  }

  return [...byHref.entries()]
    .map(([href, label]) => ({ href, label }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
}

/**
 * Adapted from the continent hub descriptions in `togstrek-continent-hub-meta.ts`
 * so the mega menu doesn't carry a second, weaker set of lines. Stored in
 * sentence case — the panel applies `uppercase` via CSS.
 */
export const togstrekContinentMegaMenuTaglines: Record<
  TogstrekUnContinentId,
  string
> = {
  europe:
    "Alpine ridges, Baltic brick, and midnight sun on the same rail pass.",
  africa:
    "Heat-haze savanna to medina alleys — trip notes from trains, trails, and taxi windows.",
  antarctica:
    "Ice, silence, and scale — expedition notes from the Peninsula and the Southern Ocean.",
  asia: "Steppes tilt into skylines without asking permission.",
  "north-america":
    "Pacific fog, desert heat, and kitchen-table Spanish, from Canada down through Central America.",
  oceania:
    "When the atlas says Pacific, it means more blue than the legend has room for.",
  "south-america":
    "The Andes pull you south until the horizon runs out of land.",
  other: "",
};

/** Single featured long-form trip per continent (right column of the mega panel). */
export type TogstrekContinentMegaMenuFeaturedAdventure = {
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
};

/**
 * Portfolio href for each nav continent — `null` when no trip is highlighted
 * (e.g. Oceania).
 */
const togstrekContinentMegaMenuFeaturedAdventureHrefByContinent: Record<
  TogstrekNavMegaContinentId,
  string | null
> = {
  africa: "/adventures/2025-the-book-of-the-dead",
  antarctica: "/adventures/2020-the-end-of-the-world",
  asia: "/adventures/2026-asia",
  europe: "/adventures/2023-hulduflk",
  "north-america": "/adventures/2022-ruins-of-central-america",
  oceania: null,
  "south-america": "/adventures/2019-chasing-the-beagle",
};

function togstrekAdventurePortfolioRowByHref(href: string) {
  return findTogstrekAdventureArchiveItemByHref(href);
}

/** Image + title for the continent mega menu “Adventures” aside. */
export function buildTogstrekMegaMenuFeaturedAdventureByContinent(): Record<
  TogstrekNavMegaContinentId,
  TogstrekContinentMegaMenuFeaturedAdventure | null
> {
  return Object.fromEntries(
    togstrekContinentNavMegaItems.map((item) => {
      const path =
        togstrekContinentMegaMenuFeaturedAdventureHrefByContinent[
          item.continentId
        ];
      if (!path) {
        return [item.continentId, null] as const;
      }
      const row = togstrekAdventurePortfolioRowByHref(path);
      if (!row) {
        throw new Error(
          `togstrek-continent-mega-menu: missing portfolio row for ${path}`,
        );
      }
      return [
        item.continentId,
        {
          href: row.href,
          title: row.title,
          imageSrc: row.imageSrc,
          imageAlt: row.imageAlt,
        } satisfies TogstrekContinentMegaMenuFeaturedAdventure,
      ] as const;
    }),
  ) as Record<
    TogstrekNavMegaContinentId,
    TogstrekContinentMegaMenuFeaturedAdventure | null
  >;
}

export type TogstrekMegaMenuNavLinks = Record<
  TogstrekNavMegaContinentId,
  { href: string; label: string }[]
>;

/** Precomputed hub links per continent in the primary nav (run on the server). */
export function buildTogstrekMegaMenuLinksForNavContinents(): TogstrekMegaMenuNavLinks {
  return Object.fromEntries(
    togstrekContinentNavMegaItems.map((item) => [
      item.continentId,
      getTogstrekContinentMegaMenuLinks(item.continentId),
    ]),
  ) as TogstrekMegaMenuNavLinks;
}

export function getTogstrekContinentMegaMenuTaglinesForNav(): Record<
  TogstrekNavMegaContinentId,
  string
> {
  return Object.fromEntries(
    togstrekContinentNavMegaItems.map((item) => [
      item.continentId,
      togstrekContinentMegaMenuTaglines[item.continentId],
    ]),
  ) as Record<TogstrekNavMegaContinentId, string>;
}
