import { togstrekMediaUrl } from "@/config/togstrek-media";
import {
  TOGSTREK_OG_IMAGE_HEIGHT,
  TOGSTREK_OG_IMAGE_WIDTH,
  type TogstrekOgImage,
} from "@/lib/togstrek-metadata";
import type { TogstrekVisitedContinentId } from "@/lib/togstrek-visited-travel-data";

/**
 * Continents served by `src/app/[continent]/page.tsx`.
 * `/europe` uses this dynamic route so `/europe/{country}` and place URLs resolve under
 * `app/[continent]/[country]` (a static `app/europe/page.tsx` would block those segments).
 */
export const TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS = [
  "africa",
  "asia",
  "europe",
  "north-america",
  "south-america",
  "oceania",
  "antarctica",
] as const satisfies readonly TogstrekVisitedContinentId[];

export type TogstrekContinentHubRouteSlug =
  (typeof TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS)[number];

export function isTogstrekContinentHubRouteSlug(
  value: string,
): value is TogstrekContinentHubRouteSlug {
  return (TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS as readonly string[]).includes(
    value,
  );
}

export type TogstrekContinentHubPageMeta = {
  title: string;
  description: string;
  path: `/${string}`;
  heroImageSrc: string;
  heroImageAlt: string;
  openGraphImages?: TogstrekOgImage[];
  /** Section intro under “Countries” — defaults to UN-list copy when omitted. */
  countriesDescription?: string;
};

const EUROPE_HUB_HERO_IMAGE = togstrekMediaUrl(
  "hiking/_hub/03+-+Alesjaure+to+Tjaktja-000743a3.jpg",
);

const EUROPE_HUB_HERO_ALT =
  "Hiking trail in mountain landscape — Kungsleden, Sweden";

/** Metadata + hero image for `/europe` (same shape as `togstrekContinentHubPageMeta` entries). */
export const togstrekEuropeHubPageMeta: TogstrekContinentHubPageMeta = {
  title: "Exploring Europe",
  description:
    "Alpine ridges, Baltic brick, and midnight sun on the same rail pass — long-form essays and photographs from every sovereign state on the continent.",
  path: "/europe",
  heroImageSrc: EUROPE_HUB_HERO_IMAGE,
  heroImageAlt: EUROPE_HUB_HERO_ALT,
  openGraphImages: [
    {
      url: EUROPE_HUB_HERO_IMAGE,
      width: TOGSTREK_OG_IMAGE_WIDTH,
      height: TOGSTREK_OG_IMAGE_HEIGHT,
      alt: EUROPE_HUB_HERO_ALT,
    },
  ],
};

const AFRICA_HUB_HERO =
  "https://media.togstrek.com/hiking/mt-kilimanjaro/01-machame-gate-machame-camp/03+Machame+Gate+-+Machame+Camp-20220306-01743a3.jpg";
const ASIA_HUB_HERO =
  "https://media.togstrek.com/hiking/nepal/annapurna/annapurna-day-2/HDR+10+-+Wide+Angle+Mountain+-+00143a3.jpg";
const NORTH_AMERICA_HUB_HERO =
  "https://media.togstrek.com/north-america/mexico/tulum/Castillo-20221223-0001.jpg";
const OCEANIA_HUB_HERO = togstrekMediaUrl(
  "oceania/australia/overview/Australia+-+016.jpg",
);
const ANTARCTICA_HUB_HERO =
  "https://media.togstrek.com/antarctica/antarctic/lamaire-channel/HDR-0003-243a3.jpg";

const ogFromHero = (src: string, alt: string): TogstrekOgImage[] => [
  {
    url: src,
    width: TOGSTREK_OG_IMAGE_WIDTH,
    height: TOGSTREK_OG_IMAGE_HEIGHT,
    alt,
  },
];

export const togstrekContinentHubPageMeta: Record<
  TogstrekContinentHubRouteSlug,
  TogstrekContinentHubPageMeta
> = {
  europe: togstrekEuropeHubPageMeta,
  africa: {
    title: "Exploring Africa",
    description:
      "Heat-haze savanna or medina alley — trip notes and photographs from trains, trails, and taxi windows across the continent.",
    path: "/africa",
    heroImageSrc: AFRICA_HUB_HERO,
    heroImageAlt:
      "Forest trail on the Machame Route toward Mount Kilimanjaro, Tanzania",
    openGraphImages: ogFromHero(
      AFRICA_HUB_HERO,
      "Forest trail on the Machame Route toward Mount Kilimanjaro, Tanzania",
    ),
  },
  asia: {
    title: "Exploring Asia",
    description:
      "Steppes tilt into skylines without asking permission — place stories and photographs from the widest arc of cultures I’ve walked end to end.",
    path: "/asia",
    heroImageSrc: ASIA_HUB_HERO,
    heroImageAlt:
      "Wide view of Himalayan peaks and ridgelines along the Annapurna trail, Nepal",
    openGraphImages: ogFromHero(
      ASIA_HUB_HERO,
      "Wide view of Himalayan peaks and ridgelines along the Annapurna trail, Nepal",
    ),
  },
  "north-america": {
    title: "Exploring North America",
    description:
      "Pacific fog, desert heat, and kitchen-table Spanish — field notes from Canada, the United States, Mexico, and the Central American and Caribbean stories filed here as their own pages.",
    path: "/north-america",
    heroImageSrc: NORTH_AMERICA_HUB_HERO,
    heroImageAlt:
      "El Castillo at the Tulum archaeological zone above the Caribbean Sea, Mexico",
    openGraphImages: ogFromHero(
      NORTH_AMERICA_HUB_HERO,
      "El Castillo at the Tulum archaeological zone above the Caribbean Sea, Mexico",
    ),
  },
  "south-america": {
    title: "Exploring South America",
    description:
      "The Andes pull you south until the horizon runs out of land — narratives and frames from high passes down to Atlantic light.",
    path: "/south-america",
    heroImageSrc:
      "https://media.togstrek.com/south-america/ecuador/isla-santa-cruz/Puerto+Ayora-0002.jpg",
    heroImageAlt:
      "Puerto Ayora waterfront on Isla Santa Cruz, Galápagos, Ecuador",
    openGraphImages: ogFromHero(
      "https://media.togstrek.com/south-america/ecuador/isla-santa-cruz/Puerto+Ayora-0002.jpg",
      "Puerto Ayora waterfront on Isla Santa Cruz, Galápagos, Ecuador",
    ),
  },
  oceania: {
    title: "Exploring Oceania",
    description:
      "When the atlas says Pacific, it means more blue than the legend has room for — Australia, New Zealand, and island arcs in trip notes and photographs.",
    path: "/oceania",
    heroImageSrc: OCEANIA_HUB_HERO,
    heroImageAlt:
      "Common wombat on dry leaf litter in bush near Ballarat, Australia",
    openGraphImages: ogFromHero(
      OCEANIA_HUB_HERO,
      "Common wombat on dry leaf litter in bush near Ballarat, Australia",
    ),
  },
  antarctica: {
    title: "Exploring Antarctica",
    description:
      "Ice, silence, and scale — expedition notes from the Peninsula and the Southern Ocean, told as places rather than a tally of countries.",
    path: "/antarctica",
    heroImageSrc: ANTARCTICA_HUB_HERO,
    heroImageAlt:
      "Ice cliffs and calm water in the Lemaire Channel, Antarctic Peninsula",
    openGraphImages: ogFromHero(
      ANTARCTICA_HUB_HERO,
      "Ice cliffs and calm water in the Lemaire Channel, Antarctic Peninsula",
    ),
    countriesDescription:
      "Antarctica is not split into countries the way other regions are — coverage here is place stories by coordinates, without a country checklist.",
  },
};
