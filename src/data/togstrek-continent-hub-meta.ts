import type { TogstrekOgImage } from "@/lib/togstrek-metadata";
import type { TogstrekVisitedContinentId } from "@/lib/togstrek-visited-travel-data";

/**
 * Continents served by `src/app/[continent]/page.tsx`.
 * Europe uses the dedicated `/europe` route — metadata lives in `togstrekEuropeHubPageMeta`.
 */
export const TOGSTREK_CONTINENT_HUB_ROUTE_SLUGS = [
  "africa",
  "asia",
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

const EUROPE_HUB_HERO_IMAGE =
  "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1676558893598-X9ZAV37ZVOCFSNYWMUSF/22e59112fefb45ea.jpg?format=2500w";

/** Metadata + hero image for `/europe` (same shape as `togstrekContinentHubPageMeta` entries). */
export const togstrekEuropeHubPageMeta: TogstrekContinentHubPageMeta = {
  title: "Exploring Europe",
  description:
    "The 50 countries who host both the largest and smallest nations in the world — photo essays and travel notes from across Europe.",
  path: "/europe",
  heroImageSrc: EUROPE_HUB_HERO_IMAGE,
  heroImageAlt:
    "Mountain landscape with snow-capped peaks, rocky terrain, and blue sky, intersected by cables.",
  openGraphImages: [
    {
      url: "https://static1.squarespace.com/static/6207d70ece223e42dd9ae587/t/62430201c259e80324888871/1648558593135/IMG_4140.jpg?format=1500w",
      width: 1500,
      height: 1000,
      alt: "Tog's Trek",
    },
  ],
};

const ogFromHero = (
  src: string,
  alt: string,
): TogstrekOgImage[] => [{ url: src, width: 2500, height: 1667, alt }];

export const togstrekContinentHubPageMeta: Record<
  TogstrekContinentHubRouteSlug,
  TogstrekContinentHubPageMeta
> = {
  africa: {
    title: "Exploring Africa",
    description:
      "Travel notes and maps across Africa — coverage against the UN country list, city stories, and an interactive map.",
    path: "/africa",
    heroImageSrc:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=2500&q=80",
    heroImageAlt:
      "Warm sunset light over savanna grassland with scattered acacia trees",
    openGraphImages: ogFromHero(
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=2500&q=80",
      "African savanna at sunset",
    ),
  },
  asia: {
    title: "Exploring Asia",
    description:
      "From steppes to skylines — maps, UN-style country coverage, and place stories across Asia.",
    path: "/asia",
    heroImageSrc:
      "https://images.unsplash.com/photo-1518509562904-e8efcc9d8e14?w=2500&q=80",
    heroImageAlt:
      "Traditional tiered pagoda at dusk with warm lanterns and sky",
    openGraphImages: ogFromHero(
      "https://images.unsplash.com/photo-1518509562904-e8efcc9d8e14?w=2500&q=80",
      "Pagoda at dusk",
    ),
  },
  "north-america": {
    title: "Exploring North America",
    description:
      "Coasts, ranges, and cities — travel progress and maps for Canada, the United States, Mexico, and the rest of the region.",
    path: "/north-america",
    heroImageSrc:
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=2500&q=80",
    heroImageAlt:
      "Dramatic granite cliff faces and forested valley in mountain light",
    openGraphImages: ogFromHero(
      "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=2500&q=80",
      "Mountain valley",
    ),
  },
  "south-america": {
    title: "Exploring South America",
    description:
      "Andes, Amazon, and southern horizons — maps and stories with coverage against the UN country list.",
    path: "/south-america",
    heroImageSrc:
      "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=2500&q=80",
    heroImageAlt:
      "Ancient stone terraces on a green mountainside under soft clouds",
    openGraphImages: ogFromHero(
      "https://images.unsplash.com/photo-1504198458649-3128b932f49e?w=2500&q=80",
      "Mountain terraces",
    ),
  },
  oceania: {
    title: "Exploring Oceania",
    description:
      "Islands, reefs, and southern skies — place stories and maps across Australia, New Zealand, and the Pacific.",
    path: "/oceania",
    heroImageSrc:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2500&q=80",
    heroImageAlt:
      "Turquoise ocean waves breaking near a rocky coastline from above",
    openGraphImages: ogFromHero(
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=2500&q=80",
      "Coastal ocean",
    ),
  },
  antarctica: {
    title: "Exploring Antarctica",
    description:
      "Ice, silence, and scale — map and notes for the coldest continent. The UN-style country list does not assign sovereign states here; stories follow coordinates and expeditions.",
    path: "/antarctica",
    heroImageSrc:
      "https://images.unsplash.com/photo-1517707711963-9e0bbac4b7d0?w=2500&q=80",
    heroImageAlt:
      "Expanse of snow and ice under a pale blue polar sky with distant mountains",
    openGraphImages: ogFromHero(
      "https://images.unsplash.com/photo-1517707711963-9e0bbac4b7d0?w=2500&q=80",
      "Antarctic ice and sky",
    ),
    countriesDescription:
      "The UN-style list of 195 sovereign states does not place countries in Antarctica. Coverage stats here reflect place stories by coordinates; there is no country checklist for this region.",
  },
};
