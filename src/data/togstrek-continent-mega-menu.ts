import {
  togstrekAsiaSpecialTerritories,
  togstrekCountryHubPathByIso2,
  togstrekEuropeSpecialTerritories,
} from "@/data/togstrek-country-hub-paths";
import {
  togstrekContinentNavMegaItems,
  type TogstrekNavMegaContinentId,
} from "@/data/togstrek-continent-nav-mega-items";
import {
  type TogstrekUnContinentId,
  togstrekUn195Countries,
} from "@/data/togstrek-un195-countries";

/** Optional display names for hubs where the site label differs from UN/common English (e.g. Czechia → Czech Republic). */
const hubMenuDisplayNameByIso2: Partial<Record<string, string>> = {
  CZ: "Czech Republic",
};

const specialTerritoriesByContinent: Partial<
  Record<TogstrekUnContinentId, { href: string; label: string }[]>
> = {
  europe: togstrekEuropeSpecialTerritories.map((t) => ({
    href: t.href,
    label: t.label,
  })),
  asia: togstrekAsiaSpecialTerritories.map((t) => ({
    href: t.href,
    label: t.label,
  })),
};

/**
 * Hub links for the mega menu: derived from `togstrekCountryHubPathByIso2`
 * (only routes you have configured) plus special-territory hubs for that
 * continent. Adding a new ISO → path entry updates the menu automatically.
 */
export function getTogstrekContinentMegaMenuLinks(
  continentId: TogstrekUnContinentId,
): { href: string; label: string }[] {
  const fromHubs: { href: string; label: string }[] = [];

  for (const [iso2, href] of Object.entries(togstrekCountryHubPathByIso2)) {
    if (!href) continue;
    const row = togstrekUn195Countries.find((c) => c.iso2 === iso2);
    if (row?.continent !== continentId) continue;
    const label = hubMenuDisplayNameByIso2[iso2] ?? row.name;
    fromHubs.push({ href, label });
  }

  const specials = specialTerritoriesByContinent[continentId] ?? [];
  return [...fromHubs, ...specials].sort((a, b) =>
    a.label.localeCompare(b.label),
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

/** Default featured trip in the continent mega menu “Adventures” aside (most regions). */
const togstrekMegaMenuDefaultAdventureLinks: { href: string; label: string }[] =
  [
    { href: "/adventures", label: "All adventures" },
    {
      href: "/adventures/2018-alpine-adventure",
      label: "2018: Alpine Adventure",
    },
  ];

/** South America mega menu aside — highlights the Patagonia / end-of-world trip. */
const togstrekMegaMenuSouthAmericaAdventureLinks: {
  href: string;
  label: string;
}[] = [
  { href: "/adventures", label: "All adventures" },
  {
    href: "/adventures/2020-the-end-of-the-world",
    label: "2020: The End of the World",
  },
];

export type TogstrekMegaMenuAdventureLink = { href: string; label: string };

/** Per-continent “Adventures” links in the primary nav continent mega panels. */
export function buildTogstrekMegaMenuAdventureLinksByContinent(): Record<
  TogstrekNavMegaContinentId,
  TogstrekMegaMenuAdventureLink[]
> {
  return Object.fromEntries(
    togstrekContinentNavMegaItems.map((item) => [
      item.continentId,
      item.continentId === "south-america"
        ? togstrekMegaMenuSouthAmericaAdventureLinks
        : togstrekMegaMenuDefaultAdventureLinks,
    ]),
  ) as Record<TogstrekNavMegaContinentId, TogstrekMegaMenuAdventureLink[]>;
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
