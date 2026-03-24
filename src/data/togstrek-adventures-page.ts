import { togstrekMediaUrl } from "@/config/togstrek-media";

/** CDN paths mirror Squarespace `_files` basenames under `adventures/`. */
export function togstrekAdventuresImage(filename: string): string {
  return togstrekMediaUrl(`adventures/${filename}`);
}

export type TogstrekAdventuresPortfolioItem = {
  href: string;
  title: string;
  imageFile: string;
};

export const TOGSTREK_ADVENTURES_HERO_IMAGE_FILE = "Gentoo+Penguins-0010.jpg";

export const togstrekAdventuresPortfolioGrid: TogstrekAdventuresPortfolioItem[] =
  [
    {
      href: "/adventures/2023-hulduflk",
      title: "2023: Huldufólk",
      imageFile: "20230731-Goðafoss+Waterfall-20230731-003A1664-HDR.jpg",
    },
    {
      href: "/adventures/2022-ruins-of-central-america",
      title: "2022: Ruins of Central America",
      imageFile: "20221211-Pyramid+of+Kukulcan--0001.jpg",
    },
    {
      href: "/adventures/2022-the-roof-of-africa",
      title: "2022: The Roof of Africa",
      imageFile: "01-Mweka-Camp-Mweka-Gate-003A3115-868.jpg",
    },
    {
      href: "/adventures/2021-pink-streets-blue-tiles",
      title: "2021: Pink Streets & Blue Tiles",
      imageFile: "5DM34311-HDR.jpg",
    },
    {
      href: "/adventures/2020-443-kilometres",
      title: "2020: 443 Kilometres",
      imageFile: "4c7643df7dfce0dc.jpeg",
    },
    {
      href: "/adventures/2020-the-end-of-the-world",
      title: "2020: The End of the World",
      imageFile: "200308-_JS_6168-HDR-1.jpg",
    },
    {
      href: "/adventures/2019-chasing-the-beagle",
      title: "2019: Chasing the Beagle",
      imageFile: "190728-GOPR1350_1564356593048_high-2.jpg",
    },
    {
      href: "/adventures/2019-seeing-sweden",
      title: "2019: Seeing Sweden",
      imageFile: "20190606-12+-+Svedjeholmen+-+Sandlagan-IMG_5282-HDR.jpg",
    },
    {
      href: "/adventures/2018-bedouin-stars",
      title: "2018: Bedouin Stars",
      imageFile: "86d3aa94eb183306.jpeg",
    },
    {
      href: "/adventures/2018-alpine-adventure",
      title: "2018: Alpine Adventure",
      imageFile: "22e59112fefb45ea.jpg",
    },
    {
      href: "/adventures/2018-12-cities-in-12-months",
      title: "2018: 12 Cities in 12 Months",
      imageFile: "181019-3.jpg",
    },
    {
      href: "/adventures/2017-pura-vida",
      title: "2017: Pura Vida",
      imageFile: "c38800fc6c663b88.jpeg",
    },
    {
      href: "/adventures/2016-casablanca",
      title: "2016: Casablanca",
      imageFile: "cbb840988099a121.jpeg",
    },
    {
      href: "/adventures/2014-tagine-dreams",
      title: "2014: Tagine Dreams",
      imageFile: "c767f7cea051be97.jpeg",
    },
    {
      href: "/adventures/2013-silent-cities-and-blue-lagoons",
      title: "2013: Silent Cities and Blue Lagoons",
      imageFile: "c60ee9c9f34fa6c1.jpeg",
    },
    {
      href: "/adventures/2013-boarding-in-bansko",
      title: "2013: Boarding in Bansko",
      imageFile: "f148309328a62577.jpeg",
    },
    {
      href: "/adventures/2012-gorillas-in-the-mud",
      title: "2012: Gorillas in the Mud",
      imageFile: "f473f9fa3fd11325.jpeg",
    },
    {
      href: "/adventures/2011-travelling-through-nepal",
      title: "2011: Travelling through Nepal",
      imageFile: "a2727776246f0486.jpeg",
    },
    {
      href: "/adventures/2010-i-left-my-stock-in-sacramento",
      title: "2010: I Left My Stock in Sacramento",
      imageFile: "5991f3145bf2f34b.jpeg",
    },
    {
      href: "/adventures/2009-thailand",
      title: "2009: Thailand",
      imageFile: "220e2a2eea05fec8.jpeg",
    },
    {
      href: "/adventures/2008-istanbul",
      title: "2008: Istanbul",
      imageFile: "5d1181ca77199310.jpeg",
    },
  ];
