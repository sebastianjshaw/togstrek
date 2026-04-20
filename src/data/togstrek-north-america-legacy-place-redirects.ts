import { buildTogstrekPlacePublicPath } from "../lib/togstrek-place-path";

/**
 * North America legacy URL fixes. Order matters: specific compound slugs before the
 * `/usa/:path*` catch-all (otherwise old one-segment place names map to the wrong folder).
 *
 * Canonical US country slug is `united-states-of-america` (continent / country / state / place).
 * Destinations use {@link buildTogstrekPlacePublicPath} so they stay aligned with the canonical
 * place URL rules in `src/lib/togstrek-place-path.ts`.
 */
const NA = "north-america";
const US = "united-states-of-america";

function legacyUsPlace(...segments: string[]): string {
  return buildTogstrekPlacePublicPath(NA, US, segments);
}

export const togstrekNorthAmericaLegacyPlaceRedirects: readonly {
  source: string;
  destination: string;
}[] = [
  {
    source: "/north-america/usa/california-big-sur",
    destination: legacyUsPlace("california", "big-sur"),
  },
  {
    source: "/north-america/usa/california-los-angeles",
    destination: legacyUsPlace("california", "los-angeles"),
  },
  {
    source: "/north-america/usa/california-malibu",
    destination: legacyUsPlace("california", "malibu"),
  },
  {
    source: "/north-america/usa/california-napa-valley",
    destination: legacyUsPlace("california", "napa-valley"),
  },
  {
    source: "/north-america/usa/california-sacramento",
    destination: legacyUsPlace("california", "sacramento"),
  },
  {
    source: "/north-america/usa/california-san-diego",
    destination: legacyUsPlace("california", "san-diego"),
  },
  {
    source: "/north-america/usa/california-san-francisco",
    destination: legacyUsPlace("california", "san-francisco"),
  },
  {
    source: "/north-america/usa/california-san-luis-obispo",
    destination: legacyUsPlace("california", "san-luis-obispo"),
  },
  {
    source: "/north-america/usa/california-san-simeon",
    destination: legacyUsPlace("california", "san-simeon"),
  },
  {
    source: "/north-america/usa/california-santa-barbara",
    destination: legacyUsPlace("california", "santa-barbara"),
  },
  {
    source: "/north-america/usa/california-santa-cruz",
    destination: legacyUsPlace("california", "santa-cruz"),
  },
  {
    source: "/north-america/usa/california-santa-monica",
    destination: legacyUsPlace("california", "santa-monica"),
  },
  {
    source: "/north-america/usa/california-sonoma",
    destination: legacyUsPlace("california", "sonoma"),
  },
  {
    source: "/north-america/usa/california-stockton",
    destination: legacyUsPlace("california", "stockton"),
  },
  {
    source: "/north-america/usa/california-yosemite",
    destination: legacyUsPlace("california", "yosemite"),
  },
  {
    source: "/north-america/usa/ny-new-york",
    destination: legacyUsPlace("new-york", "new-york"),
  },
  {
    source: "/north-america/united-states-of-america/ny/new-york",
    destination: legacyUsPlace("new-york", "new-york"),
  },
  {
    source: "/north-america/usa/texas-dallas",
    destination: legacyUsPlace("texas", "dallas"),
  },
  {
    source: "/north-america/united-states-of-america/massachusetts-boston",
    destination: legacyUsPlace("massachusetts", "boston"),
  },
  {
    source: "/north-america/united-states-of-america/new-jersey-scotch-plains",
    destination: legacyUsPlace("new-jersey", "scotch-plains"),
  },
  {
    source: "/north-america/usa",
    destination: buildTogstrekPlacePublicPath(NA, US, []),
  },
  {
    source: "/north-america/usa/:path*",
    destination: "/north-america/united-states-of-america/:path*",
  },
];
