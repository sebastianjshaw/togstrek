/**
 * Featured adventure cards for the primary nav “Adventures” mega menu (desktop + mobile).
 */

export type TogstrekAdventuresMegaFeaturedCard = {
  href: `/${string}`;
  title: string;
  imageSrc: string;
  imageAlt: string;
  width: number;
  height: number;
};

export const togstrekAdventuresMegaFeaturedCards: TogstrekAdventuresMegaFeaturedCard[] =
  [
    {
      href: "/adventures/2022-the-roof-of-africa",
      title: "2022: The Roof of Africa",
      imageSrc:
        "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1676558793446-5828DQN9LVCCNWOD1QQU/01%2BMweka%2BCamp%2B-%2BMweka%2BGate-003A3115-868.jpg",
      imageAlt:
        "Mount Kilimanjaro framed by lush green forest with hanging moss.",
      width: 1980,
      height: 1321,
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
    },
    {
      href: "/adventures/2020-443-kilometres",
      title: "2020: 443 Kilometres",
      imageSrc:
        "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1663359916952-HPHTFHNPUJPVEJNL9Q9B/03+-+Alesjaure+to+Tjaktja-0007.jpg",
      imageAlt:
        "Tent pitched near a scenic lake with mountains in the background under cloudy skies",
      width: 1920,
      height: 1280,
    },
  ];

/** Short line below the featured cards (matches legacy Squarespace mega content). */
export const togstrekAdventuresMegaTagline =
  "Sometimes my travels are bigger and deserve more attention. I’ve walked 443km of Sweden and been to the ends of the world.";
