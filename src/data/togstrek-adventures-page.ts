import { togstrekMediaUrl } from "@/config/togstrek-media";

/** CDN paths mirror Squarespace `_files` basenames under `adventures/`. */
export function togstrekAdventuresImage(filename: string): string {
  return togstrekMediaUrl(`adventures/${filename}`);
}

export type TogstrekAdventuresPortfolioItem = {
  href: string;
  title: string;
  imageFile: string;
  /** Describes the tile photograph for assistive tech (title alone is not enough). */
  imageAlt: string;
};

export const TOGSTREK_ADVENTURES_HERO_IMAGE_FILE = "Gentoo+Penguins-0010.jpg";

export const togstrekAdventuresPortfolioGrid: TogstrekAdventuresPortfolioItem[] =
  [
    {
      href: "/adventures/2023-hulduflk",
      title: "2023: Huldufólk",
      imageFile: "20230731-Goðafoss+Waterfall-20230731-003A1664-HDR.jpg",
      imageAlt:
        "Goðafoss waterfall plunging into a gorge, spray rising over basalt cliffs, Iceland",
    },
    {
      href: "/adventures/2022-ruins-of-central-america",
      title: "2022: Ruins of Central America",
      imageFile: "20221211-Pyramid+of+Kukulcan--0001.jpg",
      imageAlt:
        "El Castillo pyramid at Chichen Itza seen from the grassy plaza, Mexico",
    },
    {
      href: "/adventures/2022-the-roof-of-africa",
      title: "2022: The Roof of Africa",
      imageFile: "01-Mweka-Camp-Mweka-Gate-003A3115-868.jpg",
      imageAlt:
        "Dense forest trail on the descent from Mount Kilimanjaro, Tanzania",
    },
    {
      href: "/adventures/2021-pink-streets-blue-tiles",
      title: "2021: Pink Streets & Blue Tiles",
      imageFile: "5DM34311-HDR.jpg",
      imageAlt:
        "Sunlit façades and patterned cobbles — Portugal trip diary photograph",
    },
    {
      href: "/adventures/2020-443-kilometres",
      title: "2020: 443 Kilometres",
      imageFile: "4c7643df7dfce0dc.jpeg",
      imageAlt:
        "Forest path and lakeshore along a long Swedish section hike",
    },
    {
      href: "/adventures/2020-the-end-of-the-world",
      title: "2020: The End of the World",
      imageFile: "200308-_JS_6168-HDR-1.jpg",
      imageAlt:
        "Dramatic Patagonian peaks and stormy sky above remote trails",
    },
    {
      href: "/adventures/2019-chasing-the-beagle",
      title: "2019: Chasing the Beagle",
      imageFile: "190728-GOPR1350_1564356593048_high-2.jpg",
      imageAlt:
        "Cold southern coastline and mountains from a small-boat expedition",
    },
    {
      href: "/adventures/2019-seeing-sweden",
      title: "2019: Seeing Sweden",
      imageFile: "20190606-12+-+Svedjeholmen+-+Sandlagan-IMG_5282-HDR.jpg",
      imageAlt:
        "Rocky skerries and wind-sculpted pines along the Höga Kusten coast",
    },
    {
      href: "/adventures/2018-bedouin-stars",
      title: "2018: Bedouin Stars",
      imageFile: "86d3aa94eb183306.jpeg",
      imageAlt: "Desert camp under a wide night sky strewn with stars",
    },
    {
      href: "/adventures/2018-alpine-adventure",
      title: "2018: Alpine Adventure",
      imageFile: "22e59112fefb45ea.jpg",
      imageAlt: "High Alpine ridges and snowfields on a mountain crossing",
    },
    {
      href: "/adventures/2018-12-cities-in-12-months",
      title: "2018: 12 Cities in 12 Months",
      imageFile: "181019-3.jpg",
      imageAlt: "Urban street scene from a year of monthly city stops",
    },
    {
      href: "/adventures/2017-pura-vida",
      title: "2017: Pura Vida",
      imageFile: "c38800fc6c663b88.jpeg",
      imageAlt: "Lush tropical forest and trail light, Costa Rica",
    },
    {
      href: "/adventures/2016-casablanca",
      title: "2016: Casablanca",
      imageFile: "cbb840988099a121.jpeg",
      imageAlt: "Moroccan city streets and architecture in warm afternoon light",
    },
    {
      href: "/adventures/2014-tagine-dreams",
      title: "2014: Tagine Dreams",
      imageFile: "c767f7cea051be97.jpeg",
      imageAlt: "Colourful tagines and market ceramics, Morocco",
    },
    {
      href: "/adventures/2013-silent-cities-and-blue-lagoons",
      title: "2013: Silent Cities and Blue Lagoons",
      imageFile: "c60ee9c9f34fa6c1.jpeg",
      imageAlt: "Historic coastal stone streets and calm lagoon tones",
    },
    {
      href: "/adventures/2013-boarding-in-bansko",
      title: "2013: Boarding in Bansko",
      imageFile: "f148309328a62577.jpeg",
      imageAlt: "Snow-covered ski slopes below pine ridges, Bansko",
    },
    {
      href: "/adventures/2012-gorillas-in-the-mud",
      title: "2012: Gorillas in the Mud",
      imageFile: "f473f9fa3fd11325.jpeg",
      imageAlt: "Misty volcanic forest slopes during gorilla trekking",
    },
    {
      href: "/adventures/2011-travelling-through-nepal",
      title: "2011: Travelling through Nepal",
      imageFile: "a2727776246f0486.jpeg",
      imageAlt: "Himalayan foothill terraces and trail, Nepal",
    },
    {
      href: "/adventures/2010-i-left-my-stock-in-sacramento",
      title: "2010: I Left My Stock in Sacramento",
      imageFile: "5991f3145bf2f34b.jpeg",
      imageAlt: "Open California valley and highway landscape, USA road trip",
    },
    {
      href: "/adventures/2009-thailand",
      title: "2009: Thailand",
      imageFile: "220e2a2eea05fec8.jpeg",
      imageAlt: "Tropical shoreline silhouettes and long-tail boats, Thailand",
    },
    {
      href: "/adventures/2008-istanbul",
      title: "2008: Istanbul",
      imageFile: "5d1181ca77199310.jpeg",
      imageAlt: "Rooftops and minarets across the Istanbul skyline at dusk",
    },
  ];
