/**
 * Root slug paths for country hubs that already exist on the site.
 * Keys are ISO 3166-1 alpha-2. Extend per continent as pages are migrated.
 */
export const togstrekCountryHubPathByIso2: Partial<
  Record<string, `/${string}`>
> = {
  AT: "/austria",
  BA: "/bosnia-and-herzegovina",
  BG: "/bulgaria",
  HR: "/croatia",
  CZ: "/czech-republic",
  DK: "/denmark",
  EE: "/estonia",
  FI: "/finland",
  FR: "/france",
  DE: "/germany",
  GR: "/greece",
  HU: "/hungary",
  IS: "/iceland",
  IE: "/ireland",
  IT: "/italy",
  LV: "/latvia",
  LI: "/liechtenstein",
  LT: "/lithuania",
  MT: "/malta",
  MC: "/monaco",
  NL: "/netherlands",
  NO: "/norway",
  PT: "/portugal",
  RO: "/romania",
  RU: "/russia",
  RS: "/serbia",
  SK: "/slovakia",
  ES: "/spain",
  SE: "/sweden",
  CH: "/switzerland",
  UA: "/ukraine",
  GB: "/united-kingdom",
  AR: "/south-america/argentina",
  CO: "/south-america/colombia",
  EC: "/south-america/ecuador",
  US: "/north-america/united-states-of-america",
};

export type TogstrekSpecialTerritoryHub = {
  href: `/${string}`;
  label: string;
  note: string;
};

const togstrekEuropeSpecialTerritoriesUnsorted: TogstrekSpecialTerritoryHub[] = [
  {
    href: "/svalbard",
    label: "Svalbard",
    note: "Arctic archipelago, Norway",
  },
  {
    href: "/ladonia",
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
