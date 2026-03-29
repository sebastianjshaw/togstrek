import {
  togstrekContinentNavMegaItems,
  type TogstrekNavMegaContinentId,
} from "@/data/togstrek-continent-nav-mega-items";
import {
  togstrekAdventuresImage,
  togstrekAdventuresPortfolioGrid,
} from "@/data/togstrek-adventures-page";
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
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import { getIso2ForCountrySlug } from "@/lib/togstrek-visited-travel-data";

/** Optional display names when the site label differs from UN/common English. */
const hubMenuDisplayNameByIso2: Partial<Record<string, string>> = {
  CZ: "Czech Republic",
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
 * `content/places/…` (canonical URLs `/{continent}/{country}/…`).
 */
export function getTogstrekContinentMegaMenuLinks(
  continentId: TogstrekUnContinentId,
): { href: string; label: string }[] {
  if (continentId === "antarctica") {
    const rows = listTogstrekPlaceSlugsForCountry("antarctica", "antarctic");
    return rows
      .map(({ place }) => {
        const tail = togstrekPlacePathFromSegments(place);
        const fm = loadTogstrekPlaceFrontmatterOnly(
          "antarctica",
          "antarctic",
          place,
        );
        return {
          href: `/antarctica/antarctic/${tail}`,
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
    const href = `/${continent}/${country}`;
    byHref.set(href, countryLabelForContinentMegaMenu(continent, country));
  }

  return [...byHref.entries()]
    .map(([href, label]) => ({ href, label }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { sensitivity: "base" }),
    );
}

export const togstrekContinentMegaMenuTaglines: Record<
  TogstrekUnContinentId,
  string
> = {
  europe:
    "THE 50 COUNTRIES WHO HOST BOTH THE LARGEST AND SMALLEST NATIONS IN THE WORLD.",
  africa:
    "FROM THE MAGHREB TO THE CAPE — DESERTS, DELTAS, AND DIVERSE CITIES.",
  antarctica: "ICE, RESEARCH STATIONS, AND THE LAST GREAT WILDERNESS.",
  asia: "FROM STEPPES TO SKYLINES — THE WORLD'S LARGEST CONTINENT.",
  "north-america":
    "FROM ARCTIC TUNDRA TO DESERT RANGES — COASTS, CANYONS, AND CITIES.",
  oceania: "ISLAND NATIONS, REEFS, AND VAST SOUTHERN SKIES.",
  "south-america": "ANDES, AMAZON, AND PATAGONIAN HORIZONS.",
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
  africa: "/adventures/2022-the-roof-of-africa",
  antarctica: "/adventures/2020-the-end-of-the-world",
  asia: "/adventures/2018-bedouin-stars",
  europe: "/adventures/2023-hulduflk",
  "north-america": "/adventures/2022-ruins-of-central-america",
  oceania: null,
  "south-america": "/adventures/2019-chasing-the-beagle",
};

function togstrekAdventurePortfolioRowByHref(
  href: string,
): (typeof togstrekAdventuresPortfolioGrid)[number] | undefined {
  return togstrekAdventuresPortfolioGrid.find((p) => p.href === href);
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
          imageSrc: togstrekAdventuresImage(row.imageFile),
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
