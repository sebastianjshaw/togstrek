/** Continents that appear in the primary nav mega menu (not `other`). */
export type TogstrekNavMegaContinentId =
  | "africa"
  | "antarctica"
  | "asia"
  | "europe"
  | "north-america"
  | "oceania"
  | "south-america";

export type TogstrekContinentNavMegaItem = {
  href: `/${string}`;
  label: string;
  continentId: TogstrekNavMegaContinentId;
};

export const togstrekContinentNavMegaItems: readonly TogstrekContinentNavMegaItem[] =
  [
    { href: "/africa", label: "Africa", continentId: "africa" },
    { href: "/antarctica", label: "Antarctica", continentId: "antarctica" },
    { href: "/asia", label: "Asia", continentId: "asia" },
    { href: "/europe", label: "Europe", continentId: "europe" },
    {
      href: "/north-america",
      label: "North America",
      continentId: "north-america",
    },
    { href: "/oceania", label: "Oceania", continentId: "oceania" },
    {
      href: "/south-america",
      label: "South America",
      continentId: "south-america",
    },
  ];
