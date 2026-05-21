import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";
import type { TogstrekCardGradientId } from "@/data/togstrek-card-gradients";

/**
 * Homepage “Where to” region tiles. `imageSrc` / `imageAlt` use heroes from
 * migrated place MDX on the CDN (`content/places/...`).
 */
export type TogstrekRegionGridItem = {
  href: string;
  label: string;
  blurb: string;
  gradient: TogstrekCardGradientId;
  imageSrc?: string;
  imageAlt?: string;
  /** Full-width row on md+ plus hero typography (Europe). */
  featured?: boolean;
  /** Full-width row on md+ without featured hero styles (Other Work). */
  fullWidth?: boolean;
};

function mediaPath(pathAfterHost: string): string {
  const base = getTogstrekMediaBaseUrl();
  const p = pathAfterHost.startsWith("/") ? pathAfterHost : `/${pathAfterHost}`;
  return `${base}${p}`;
}

export const togstrekRegionGridItems: TogstrekRegionGridItem[] = [
  {
    href: "/adventures",
    label: "Adventures",
    blurb: "Longer trips & focused stories",
    gradient: "adventures",
    imageSrc: mediaPath(
      "adventures/20230731-Goðafoss+Waterfall-20230731-003A1664-HDR.jpg",
    ),
    imageAlt:
      "Goðafoss waterfall plunging into a gorge, spray rising over basalt cliffs, Iceland",
  },
  {
    href: "/africa",
    label: "Africa",
    blurb: "Deserts, cities, wildlife",
    gradient: "africa",
    imageSrc: mediaPath(
      "/africa/tanzania/ngorongoro-crater/DxO-20220316-0004.jpg",
    ),
    imageAlt: "Ngorongoro Crater landscape with zebra, Tanzania",
  },
  {
    href: "/antarctica",
    label: "Antarctica",
    blurb: "Ice, silence, scale",
    gradient: "antarctica",
    imageSrc: mediaPath(
      "/antarctica/antarctic/paradise-harbour/IMG_4731-HDR43a3.jpg",
    ),
    imageAlt:
      "Antarctic shoreline and peaks in soft light — Paradise Harbour",
  },
  {
    href: "/asia",
    label: "Asia",
    blurb: "Temples to skylines",
    gradient: "asia",
    imageSrc: mediaPath("/asia/nepal/bhaktapur/HDR+3-001.jpg"),
    imageAlt: "Bhaktapur temple architecture and courtyard, Nepal",
  },
  {
    href: "/europe",
    label: "Europe",
    blurb: "Capitals, Alps, and cobbled streets",
    gradient: "europe",
    imageSrc: mediaPath(
      "/europe/denmark/copenhagen/20160903+-+Copenhagen+-+001-243a3.jpg",
    ),
    imageAlt: "Evening view over Copenhagen rooftops",
    featured: true,
  },
  {
    href: "/north-america",
    label: "North America",
    blurb: "Coast to range",
    gradient: "northAmerica",
    imageSrc: mediaPath(
      "/north-america/mexico/tulum/Castillo-20221223-0001.jpg",
    ),
    imageAlt:
      "El Castillo at the Tulum archaeological zone above the Caribbean Sea",
  },
  {
    href: "/oceania",
    label: "Oceania",
    blurb: "Islands & horizons",
    gradient: "oceania",
    imageSrc: mediaPath("oceania/australia/Australia.png"),
    imageAlt: "Australia",
  },
  {
    href: "/south-america",
    label: "South America",
    blurb: "Andes to jungle",
    gradient: "southAmerica",
    imageSrc: mediaPath(
      "/south-america/argentina/beagle-channel/20200313+-+TogsTrek+-+5DM3726843a3.jpg",
    ),
    imageAlt: "Mountains and water along the Beagle Channel, Tierra del Fuego",
  },
  {
    href: "/hiking",
    label: "Hiking",
    blurb: "Trails & treks",
    gradient: "hiking",
    imageSrc: mediaPath(
      "/hiking/mt-kilimanjaro/03-shira-camp-barranco-camp/05+Sunset-20220308-02743a3.jpg",
    ),
    imageAlt:
      "Sunset light on Mount Kilimanjaro between Shira Camp and Barranco Camp",
  },
  {
    href: "/other-work",
    label: "Other Work",
    blurb: "Beyond travel",
    gradient: "otherWork",
    imageSrc: mediaPath(
      "other-work/models/ella-de-vine/20101121-_JS_4063-406343a3.webp",
    ),
    imageAlt: "Ella De Vine — studio portrait, Models & Fashion",
    fullWidth: true,
  },
];
