/**
 * North America legacy URL fixes. Order matters: specific compound slugs before the
 * `/usa/:path*` catch-all (otherwise old one-segment place names map to the wrong folder).
 *
 * Canonical US country slug is `united-states-of-america` (continent / country / state / place).
 */
export const togstrekNorthAmericaLegacyPlaceRedirects: readonly {
  source: string;
  destination: string;
}[] = [
  {
    source: "/north-america/usa/california-big-sur",
    destination:
      "/north-america/united-states-of-america/california/big-sur",
  },
  {
    source: "/north-america/usa/california-los-angeles",
    destination:
      "/north-america/united-states-of-america/california/los-angeles",
  },
  {
    source: "/north-america/usa/california-malibu",
    destination:
      "/north-america/united-states-of-america/california/malibu",
  },
  {
    source: "/north-america/usa/california-napa-valley",
    destination:
      "/north-america/united-states-of-america/california/napa-valley",
  },
  {
    source: "/north-america/usa/california-sacramento",
    destination:
      "/north-america/united-states-of-america/california/sacramento",
  },
  {
    source: "/north-america/usa/california-san-diego",
    destination:
      "/north-america/united-states-of-america/california/san-diego",
  },
  {
    source: "/north-america/usa/california-san-francisco",
    destination:
      "/north-america/united-states-of-america/california/san-francisco",
  },
  {
    source: "/north-america/usa/california-san-luis-obispo",
    destination:
      "/north-america/united-states-of-america/california/san-luis-obispo",
  },
  {
    source: "/north-america/usa/california-san-simeon",
    destination:
      "/north-america/united-states-of-america/california/san-simeon",
  },
  {
    source: "/north-america/usa/california-santa-barbara",
    destination:
      "/north-america/united-states-of-america/california/santa-barbara",
  },
  {
    source: "/north-america/usa/california-santa-cruz",
    destination:
      "/north-america/united-states-of-america/california/santa-cruz",
  },
  {
    source: "/north-america/usa/california-santa-monica",
    destination:
      "/north-america/united-states-of-america/california/santa-monica",
  },
  {
    source: "/north-america/usa/california-sonoma",
    destination:
      "/north-america/united-states-of-america/california/sonoma",
  },
  {
    source: "/north-america/usa/california-stockton",
    destination:
      "/north-america/united-states-of-america/california/stockton",
  },
  {
    source: "/north-america/usa/california-yosemite",
    destination:
      "/north-america/united-states-of-america/california/yosemite",
  },
  {
    source: "/north-america/usa/ny-new-york",
    destination: "/north-america/united-states-of-america/ny/new-york",
  },
  {
    source: "/north-america/usa/texas-dallas",
    destination: "/north-america/united-states-of-america/texas/dallas",
  },
  {
    source:
      "/north-america/united-states-of-america/massachusetts-boston",
    destination:
      "/north-america/united-states-of-america/massachusetts/boston",
  },
  {
    source:
      "/north-america/united-states-of-america/new-jersey-scotch-plains",
    destination:
      "/north-america/united-states-of-america/new-jersey/scotch-plains",
  },
  {
    source: "/north-america/usa",
    destination: "/north-america/united-states-of-america",
  },
  {
    source: "/north-america/usa/:path*",
    destination: "/north-america/united-states-of-america/:path*",
  },
];
