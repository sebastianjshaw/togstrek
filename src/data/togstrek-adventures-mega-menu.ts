/**
 * Featured adventure cards for the primary nav “Adventures” mega menu (desktop + mobile).
 */

import { togstrekMediaUrl } from "@/config/togstrek-media";

function togstrekAdventuresMegaImage(filename: string): string {
  return togstrekMediaUrl(`adventures/${filename}`);
}

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

export const togstrekAdventuresMegaFeaturedCards: TogstrekAdventuresMegaFeaturedCard[] =
  [
    {
      href: "/adventures/2022-the-roof-of-africa",
      title: "2022: The Roof of Africa",
      imageSrc: togstrekAdventuresMegaImage(
        "01-Mweka-Camp-Mweka-Gate-003A3115-868.jpg",
      ),
      imageAlt:
        "Mount Kilimanjaro framed by lush green forest with hanging moss.",
      width: 1980,
      height: 1321,
      spotlightTagline:
        "Kilimanjaro from rainforest to summit — heat, ice, and the long walk down.",
      spotlightCtaLabel: "Open The Roof of Africa",
    },
    {
      href: "/adventures/2021-pink-streets-blue-tiles",
      title: "2021: Pink Streets & Blue Tiles",
      imageSrc:
        "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1644686266006-D6LQC5CR3X9ZPONM7RXG/eebabc2b99d71eff.jpg",
      imageAlt:
        "Traditional boats on the Douro River in Porto, Portugal, with hillside buildings and a blue sky in the background.",
      width: 2880,
      height: 1440,
      spotlightTagline:
        "Porto in river light — azulejos, wine country edges, and city rhythm.",
      spotlightCtaLabel: "Open Pink Streets & Blue Tiles",
    },
    {
      href: "/adventures/2020-443-kilometres",
      title: "2020: 443 Kilometres",
      imageSrc: togstrekAdventuresMegaImage(
        "03-Alesjaure-to-Tjaktja-0007.jpg",
      ),
      imageAlt:
        "Tent pitched near a scenic lake with mountains in the background under cloudy skies",
      width: 1920,
      height: 1280,
      spotlightTagline:
        "The King’s Trail, hut to hut — Swedish summer as a 443 km line on the map.",
      spotlightCtaLabel: "Open 443 Kilometres",
    },
  ];

/** Short line below the featured cards (matches legacy Squarespace mega content). */
export const togstrekAdventuresMegaTagline =
  "Sometimes my travels are bigger and deserve more attention. I’ve walked 443km of Sweden and been to the ends of the world.";
