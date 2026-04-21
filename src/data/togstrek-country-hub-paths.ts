/**
 * Canonical paths for country hubs that already exist on the site.
 * Keys are ISO 3166-1 alpha-2. European hubs use `/europe/{country}` (see `app/[continent]/[country]`).
 */

/** Header + Europe tile image for `/europe/sweden` (not per-län hubs — see `resolveTogstrekCountryHubHeaderHero`). */
export const TOGSTREK_SWEDEN_COUNTRY_HUB_HERO: { src: string; alt: string } = {
  src: "https://media.togstrek.com/europe/sweden/vastra-gotaland/branno/2018-10-13+-+Branno-20181013-0001-243a3.jpg",
  alt: "Brännö — rocky coast and archipelago, Västra Götaland, Sweden",
};

/** Optional card title on continent hubs when it should differ from the UN English name (e.g. Türkiye). */
export const togstrekCountryHubTileTitleByIso2: Partial<
  Record<string, string>
> = {
  TR: "Türkiye",
};

export const togstrekCountryHubPathByIso2: Partial<
  Record<string, `/${string}`>
> = {
  AT: "/europe/austria",
  BA: "/europe/bosnia-and-herzegovina",
  BG: "/europe/bulgaria",
  HR: "/europe/croatia",
  CZ: "/europe/czech-republic",
  DK: "/europe/denmark",
  EE: "/europe/estonia",
  FI: "/europe/finland",
  FR: "/europe/france",
  DE: "/europe/germany",
  GR: "/europe/greece",
  HU: "/europe/hungary",
  IS: "/europe/iceland",
  IE: "/europe/ireland",
  IT: "/europe/italy",
  LV: "/europe/latvia",
  /** Site hub slug. Vaduz and related MDX use `europe/liechtenstein/…` on the CDN. */
  LI: "/europe/liechtenstein",
  LT: "/europe/lithuania",
  MT: "/europe/malta",
  MC: "/europe/monaco",
  NL: "/europe/netherlands",
  NO: "/europe/norway",
  PT: "/europe/portugal",
  RO: "/europe/romania",
  RU: "/europe/russia",
  RS: "/europe/serbia",
  SK: "/europe/slovakia",
  ES: "/europe/spain",
  SE: "/europe/sweden",
  CH: "/europe/switzerland",
  TR: "/europe/turkiye",
  UA: "/europe/ukraine",
  GB: "/europe/united-kingdom",
  AR: "/south-america/argentina",
  CO: "/south-america/colombia",
  EC: "/south-america/ecuador",
  US: "/north-america/united-states-of-america",
};

/**
 * ISO2 codes shown on a continent hub even when `togstrek-un195-countries` assigns
 * them to another region. Türkiye is M49 “Western Asia” here but the site hub
 * lives at `/europe/turkiye`, so it must appear in the Europe country grid too.
 */
export const TOGSTREK_CONTINENT_HUB_CROSS_LIST_ISO2_BY_CONTINENT: Readonly<
  Record<string, readonly string[]>
> = {
  europe: ["TR"],
};

/**
 * Old one-segment hub URLs (`/{slug}`) now served at `/europe/{slug}`.
 * Used for permanent redirects in `next.config.ts`.
 */
export const TOGSTREK_EUROPE_LEGACY_FLAT_HUB_SLUGS: readonly string[] = [
  "austria",
  "bosnia-and-herzegovina",
  "bulgaria",
  "croatia",
  "czech-republic",
  "denmark",
  "estonia",
  "finland",
  "france",
  "germany",
  "greece",
  "hungary",
  "iceland",
  "ireland",
  "italy",
  "latvia",
  "lithuania",
  "malta",
  "monaco",
  "netherlands",
  "norway",
  "portugal",
  "romania",
  "russia",
  "serbia",
  "slovakia",
  "spain",
  "sweden",
  "switzerland",
  "ukraine",
  "united-kingdom",
];

export type TogstrekSpecialTerritoryHub = {
  href: `/${string}`;
  label: string;
  note: string;
};

const togstrekEuropeSpecialTerritoriesUnsorted: TogstrekSpecialTerritoryHub[] = [
  {
    href: "/europe/norway/svalbard/longyearbyen",
    label: "Svalbard",
    note: "Arctic archipelago, Norway",
  },
  {
    href: "/europe/sweden",
    label: "Ladonia",
    note: "Micronation, Swedish coast",
  },
];

/** Territories and similar areas with their own hub pages (not separate UN member rows). */
export const togstrekEuropeSpecialTerritories: TogstrekSpecialTerritoryHub[] =
  [...togstrekEuropeSpecialTerritoriesUnsorted].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

const togstrekAsiaSpecialTerritoriesUnsorted: TogstrekSpecialTerritoryHub[] = [
  {
    href: "/asia/hong-kong",
    label: "Hong Kong",
    note: "Special administrative region, China",
  },
];

export const togstrekAsiaSpecialTerritories: TogstrekSpecialTerritoryHub[] = [
  ...togstrekAsiaSpecialTerritoriesUnsorted,
].sort((a, b) => a.label.localeCompare(b.label));

/** All territory hubs with dedicated pages (for home and global navigation). */
export const togstrekAllSpecialTerritories: TogstrekSpecialTerritoryHub[] = [
  ...togstrekEuropeSpecialTerritoriesUnsorted,
  ...togstrekAsiaSpecialTerritoriesUnsorted,
].sort((a, b) => a.label.localeCompare(b.label));
