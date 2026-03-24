import type { TogstrekUnContinentId } from "@/data/togstrek-un195-countries";

export type TogstrekContinentNavMegaItem = {
  href: `/${string}`;
  label: string;
  continentId: TogstrekUnContinentId;
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

export type TogstrekNavMegaContinentId =
  (typeof togstrekContinentNavMegaItems)[number]["continentId"];
