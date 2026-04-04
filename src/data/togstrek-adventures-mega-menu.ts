/**
 * Featured adventure cards for the primary nav “Adventures” mega menu (desktop + mobile).
 *
 * Card data is built on the server from `listSortedTogstrekAdventureArchiveItems()` — see
 * `togstrek-adventures-mega-menu-cards.ts`. This module stays client-safe (no `fs`).
 */

/** Shape expected from the adventure archive (matches `TogstrekAdventureArchiveItem`). */
export type TogstrekAdventuresMegaPortfolioRow = {
  href: string;
  title: string;
  imageSrc: string;
  imageAlt: string;
  published?: string;
};

export type TogstrekAdventuresMegaFeaturedCard = {
  href: `/${string}`;
  title: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
  /** Home spotlight tagline (media card) — not shown in the nav mega thumbnails. */
  spotlightTagline: string;
  /** Optional; defaults to “Open adventure” on the home spotlight. */
  spotlightCtaLabel?: string;
};

/** Optional dimensions + copy for spotlight; keyed by adventure href. */
const MEGA_CARD_META: Partial<
  Record<
    string,
    {
      width: number;
      height: number;
      spotlightTagline: string;
      spotlightCtaLabel: string;
    }
  >
> = {
  "/adventures/2023-hulduflk": {
    width: 1920,
    height: 1280,
    spotlightTagline:
      "Iceland’s waterfalls, hidden folk tales, and the long light of summer on the road.",
    spotlightCtaLabel: "Open Huldufólk",
  },
  "/adventures/2022-ruins-of-central-america": {
    width: 1920,
    height: 1280,
    spotlightTagline:
      "Maya cities and jungle-shaded plazas from Mexico to the highlands.",
    spotlightCtaLabel: "Open Ruins of Central America",
  },
  "/adventures/2022-the-roof-of-africa": {
    width: 1980,
    height: 1321,
    spotlightTagline:
      "Kilimanjaro from rainforest to summit — heat, ice, and the long walk down.",
    spotlightCtaLabel: "Open The Roof of Africa",
  },
  "/adventures/2024-five-stans-silk-road": {
    width: 1920,
    height: 1280,
    spotlightTagline:
      "Bishkek to Ashgabat — five countries, Soviet layers, yurt camps, and Darvaza burning in the Karakum.",
    spotlightCtaLabel: "Open Five Stans",
  },
};

/**
 * Top three entries from an archive list already sorted newest-first
 * (`listSortedTogstrekAdventureArchiveItems`).
 */
export function buildTogstrekAdventuresMegaFeaturedCards(
  archiveSortedNewestFirst: readonly TogstrekAdventuresMegaPortfolioRow[],
): TogstrekAdventuresMegaFeaturedCard[] {
  const topThree = archiveSortedNewestFirst.slice(0, 3);

  return topThree.map((item) => {
    const meta = MEGA_CARD_META[item.href];
    return {
      href: item.href as `/${string}`,
      title: item.title,
      imageSrc: item.imageSrc,
      imageAlt: item.imageAlt,
      width: meta?.width ?? 1920,
      height: meta?.height ?? 1280,
      spotlightTagline: meta?.spotlightTagline ?? item.title,
      spotlightCtaLabel: meta?.spotlightCtaLabel ?? "Open adventure",
    };
  });
}

/** Short line below the featured cards (matches legacy Squarespace mega content). */
export const togstrekAdventuresMegaTagline =
  "Sometimes my travels are bigger and deserve more attention — from Iceland’s falls to Maya plazas and the roof of Africa.";
