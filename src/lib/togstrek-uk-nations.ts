import type { TogstrekCardGradientId } from "@/data/togstrek-card-gradients";
import {
  discoverTogstrekPlaceSlugs,
  togstrekPlaceMdxExists,
  type TogstrekPlaceSlugParams,
} from "@/lib/togstrek-place-mdx-fs";

/** First URL segment for place MDX under `united-kingdom` that maps to England. */
const UK_FIRST_SEGMENT_ENGLAND: readonly string[] = [
  "england",
  "greater-london",
  "devon",
  "stratford-upon-avon",
];

export const UK_NATION_SLUGS = [
  "england",
  "scotland",
  "wales",
  "northern-ireland",
] as const;

export type UkNationSlug = (typeof UK_NATION_SLUGS)[number];

export function isUkNationSlug(value: string): value is UkNationSlug {
  return (UK_NATION_SLUGS as readonly string[]).includes(value);
}

const UK_NATION_LABEL: Record<UkNationSlug, string> = {
  england: "England",
  scotland: "Scotland",
  wales: "Wales",
  "northern-ireland": "Northern Ireland",
};

export function getUkNationLabel(slug: UkNationSlug): string {
  return UK_NATION_LABEL[slug];
}

/** Short blurbs for the UK hub nation cards. */
export const UK_NATION_CARD_BLURB: Record<UkNationSlug, string> = {
  england:
    "From London and the south coast to the Lakes — cities, coast, and countryside.",
  scotland: "Highlands, islands, and city breaks — Edinburgh and beyond.",
  wales: "Castles, coast paths, and mountain country.",
  "northern-ireland":
    "Belfast, the Causeway Coast, and towns across the six counties.",
};

/** Gradients for nation cards (match region-card language; distinct hues). */
export const UK_NATION_CARD_GRADIENT: Record<UkNationSlug, TogstrekCardGradientId> =
  {
    england: "ukEngland",
    scotland: "ukScotland",
    wales: "ukWales",
    "northern-ireland": "ukNorthernIreland",
  };

/**
 * Whether a place row under `europe/united-kingdom` belongs to a UK nation hub
 * (used to filter cards and map pins).
 */
export function placeRowBelongsToUkNation(
  placeSegments: string[],
  nation: UkNationSlug,
): boolean {
  if (placeSegments.length === 0) return false;
  const first = placeSegments[0]!;
  switch (nation) {
    case "england":
      return UK_FIRST_SEGMENT_ENGLAND.includes(first);
    case "scotland":
      return first === "scotland";
    case "wales":
      return first === "wales";
    case "northern-ireland":
      return first === "northern-ireland";
    default:
      return false;
  }
}

/** All place rows for one nation (sorted by path). */
export function listTogstrekPlaceSlugsForUkNation(
  nation: UkNationSlug,
): { place: string[] }[] {
  return discoverTogstrekPlaceSlugs()
    .filter(
      (s) =>
        s.continent === "europe" &&
        s.country === "united-kingdom" &&
        placeRowBelongsToUkNation(s.place, nation),
    )
    .map((s) => ({ place: s.place }))
    .sort((a, b) =>
      a.place.join("/").localeCompare(b.place.join("/"), undefined, {
        sensitivity: "base",
      }),
    );
}

/** Static route params for `/europe/united-kingdom/{nation}` hub pages (no MDX file). */
export function discoverTogstrekUkNationHubParams(): TogstrekPlaceSlugParams[] {
  return UK_NATION_SLUGS.map((nation) => ({
    continent: "europe",
    country: "united-kingdom",
    place: [nation],
  }));
}

/**
 * `/europe/united-kingdom/{england|…}` hub route: one segment, no matching `.mdx`
 * file (the nation is a folder of places, not a leaf page).
 */
export function isUkNationHubRoute(
  continent: string,
  country: string,
  place: string[],
): boolean {
  if (continent !== "europe" || country !== "united-kingdom") return false;
  if (place.length !== 1) return false;
  const seg = place[0]!;
  if (!isUkNationSlug(seg)) return false;
  return !togstrekPlaceMdxExists(continent, country, place);
}
