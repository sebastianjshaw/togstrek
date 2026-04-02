import { getTogstrekMediaBaseUrl } from "@/config/togstrek-media";

/**
 * Homepage “Where to” region tiles. `imageSrc` / `imageAlt` use heroes from
 * migrated place MDX on the CDN (`content/places/...`).
 */
export type TogstrekRegionGridItem = {
  href: string;
  label: string;
  blurb: string;
  gradient: string;
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
    gradient: "from-[#1a1420] via-[#2d1f28] to-[#e31937]/40",
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
    gradient: "from-[#3d2914] via-[#6b3a1a] to-[#1a1420]",
    imageSrc: mediaPath(
      "/africa/tanzania/ngorongoro-crater/DxO-20220316-0004.jpg",
    ),
    imageAlt: "Ngorongoro Crater landscape with zebra, Tanzania",
  },
  {
    href: "/antarctica",
    label: "Antarctica",
    blurb: "Ice, silence, scale",
    gradient: "from-[#0c1829] via-[#1e3a5f] to-[#7cb8d8]/35",
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
    gradient: "from-[#1a1420] via-[#4a1538] to-[#e31937]/35",
    imageSrc: mediaPath("/asia/nepal/bhaktapur/HDR+3-001.jpg"),
    imageAlt: "Bhaktapur temple architecture and courtyard, Nepal",
  },
  {
    href: "/europe",
    label: "Europe",
    blurb: "Capitals, Alps, and cobbled streets",
    gradient: "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30",
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
    gradient: "from-[#1a2332] via-[#2d4a3e] to-[#c4a574]/25",
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
    gradient: "from-[#0f2d3a] via-[#1e5c6b] to-[#7ec8d3]/30",
    imageSrc: mediaPath(
      "oceania/australia/overview/Australia+-+016.jpg",
    ),
    imageAlt:
      "Common wombat on dry leaf litter in bush near Ballarat, Australia",
  },
  {
    href: "/south-america",
    label: "South America",
    blurb: "Andes to jungle",
    gradient: "from-[#2a1a14] via-[#4a2a18] to-[#e35d2d]/35",
    imageSrc: mediaPath(
      "/south-america/argentina/beagle-channel/20200313+-+TogsTrek+-+5DM3726843a3.jpg",
    ),
    imageAlt: "Mountains and water along the Beagle Channel, Tierra del Fuego",
  },
  {
    href: "/hiking",
    label: "Hiking",
    blurb: "Trails & treks",
    gradient: "from-[#1b2a1e] via-[#2f4a32] to-[#8fbc8f]/25",
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
    gradient: "from-[#1a1420] via-[#2a2230] to-[#8880a0]/35",
    imageSrc: mediaPath(
      "other-work/models/ella-de-vine/20101121-_JS_4063-406343a3.webp",
    ),
    imageAlt: "Ella De Vine — studio portrait, Models & Fashion",
    fullWidth: true,
  },
];
