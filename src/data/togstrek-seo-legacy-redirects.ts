/**
 * Permanent redirects for legacy Squarespace / crawl paths surfaced in
 * Google Search Console (404s, duplicate canonicals, query-string variants).
 *
 * Consumed by `next.config.ts` — keep sources path-only (no origin).
 */

/** Region roots only — avoids matching e.g. `/blog/foo/adventures/…`. */
const TOGSTREK_SEO_LEGACY_CONTINENT_SLUGS = [
  "africa",
  "antarctica",
  "asia",
  "europe",
  "north-america",
  "oceania",
  "south-america",
] as const;

const togstrekSeoLegacyAdventureUnderContinentRedirects =
  TOGSTREK_SEO_LEGACY_CONTINENT_SLUGS.flatMap((continent) => [
    {
      source: `/${continent}/tag/adventures/:slug`,
      destination: "/adventures/:slug",
    },
    {
      source: `/${continent}/category/adventures/:slug`,
      destination: "/adventures/:slug",
    },
    {
      source: `/${continent}/:country/adventures/:slug`,
      destination: "/adventures/:slug",
    },
  ]);

export const togstrekSeoLegacyRedirects: {
  source: string;
  destination: string;
}[] = [
  { source: "/home", destination: "/" },
  { source: "/tag", destination: "/" },
  { source: "/tag/", destination: "/" },
  /** Duplicate continent segment from old exports / bad links */
  { source: "/europe/europe/:path*", destination: "/europe/:path*" },
  /** Legacy Antarctic category URLs (title case + spaces) → flat place slugs */
  {
    source: "/antarctica/category/Yalour%20Islands",
    destination: "/antarctica/yalour-islands",
  },
  {
    source: "/antarctica/category/Jenny%20Island",
    destination: "/antarctica/jenny-island",
  },
  {
    source: "/antarctica/category/The%20Gullet",
    destination: "/antarctica/the-gullet",
  },
  {
    source: "/antarctica/category/Pourquoi%20Pas%20Island",
    destination: "/antarctica/pourquoi-pas-island",
  },
  ...togstrekSeoLegacyAdventureUnderContinentRedirects,
  {
    source: "/photography/guides/adventures/:slug",
    destination: "/adventures/:slug",
  },
  { source: "/antarctica/adventures/:slug", destination: "/adventures/:slug" },
  /** Trailing slash on section hubs (canonical has no trailing slash) */
  { source: "/hiking/", destination: "/hiking" },
  { source: "/north-america/", destination: "/north-america" },
  /** Old blog photo-diary URLs → current place or adventure pages */
  {
    source: "/blog/alpine-adventure-exploring-chamonix",
    destination: "/europe/france/chamonix",
  },
  {
    source: "/blog/alpine-adventure-exploring-cern",
    destination: "/europe/switzerland/meyrin",
  },
  {
    source: "/blog/alpine-adventure-monaco",
    destination: "/europe/monaco/monaco",
  },
  {
    source: "/blog/alpine-adventure-fenis",
    destination: "/europe/italy/fenis",
  },
  {
    source: "/blog/alpine-adventure-exploring-aosta",
    destination: "/europe/italy/aosta",
  },
  { source: "/blog/finding-mozart", destination: "/europe/austria/salzburg" },
  { source: "/blog/innsbruck", destination: "/europe/austria/innsbruck" },
  {
    source: "/blog/nature-walks-in-le-chatelard",
    destination: "/europe/france/le-chatelard",
  },
  /**
   * Legacy “Paróquia da Vera Cruz” link sat under a duplicated `europe` segment;
   * content lives on the Aveiro place page (`placeSlug: averio`).
   */
  {
    source:
      "/europe/europe/portugal/Par%C3%B3quia%20da%20Vera%20Cruz",
    destination: "/europe/portugal/averio",
  },
];
