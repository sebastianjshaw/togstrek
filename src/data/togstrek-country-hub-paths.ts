/**
 * Canonical paths for country hubs that already exist on the site.
 * Keys are ISO 3166-1 alpha-2. European hubs use `/europe/{country}` (see `app/[continent]/[country]`).
 */
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
  /** Mirror / content folder uses `lichtenstein` (matches MDX + R2 keys). */
  LI: "/europe/lichtenstein",
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
    href: "/hong-kong",
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
