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
  { source: "/south-america/", destination: "/south-america" },
  {
    source: "/other-work/merlin",
    destination: "/photography/events/meeting-merlin",
  },
  /** Retired “Avalon” project — consolidated to Other work hub for external links */
  { source: "/other-work/avalon", destination: "/other-work" },
  { source: "/photography/avalon/:path*", destination: "/other-work" },
  { source: "/photography/avalon-visit-2", destination: "/other-work" },
  { source: "/photography/avalon-family-tour", destination: "/other-work" },
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
  /** Legacy MD typo in internal links and old exports (`israel` misspelled). */
  {
    source: "/asia/isreal/:path*",
    destination: "/asia/israel/:path*",
  },
  { source: "/tajikistan", destination: "/asia/tajikistan" },
  /** Old Squarespace one-segment shortcuts → current place / trail hubs */
  { source: "/kilimanjaro", destination: "/hiking/mt-kilimanjaro" },
  {
    source: "/massachusetts",
    destination: "/north-america/united-states-of-america/massachusetts",
  },
  { source: "/skane", destination: "/europe/sweden/skane" },
  { source: "/varmland", destination: "/europe/sweden/varmland" },
  { source: "/blog/jerash", destination: "/asia/jordan/jerash" },
  {
    source: "/blog/philadelphia",
    destination: "/asia/jordan/philadelphia",
  },
  {
    source: "/portfolio/tagged/visby",
    destination: "/europe/sweden/gotland/visby",
  },
  { source: "/portfolio/kalmar", destination: "/europe/sweden/kalmar/kalmar" },
  {
    source: "/blog/tagged/apapa",
    destination: "/africa/nigeria/apapa",
  },
  { source: "/blog/tagged/hungary", destination: "/europe/hungary" },
  {
    source: "/blog/tagged/travelphotography",
    destination: "/other-work",
  },
  {
    source: "/blog/tagged/travel-photography",
    destination: "/other-work",
  },
  { source: "/blog/tagged/algar", destination: "/europe/portugal" },
  { source: "/blog/innsbruck", destination: "/europe/austria/innsbruck" },
  {
    source: "/blog/nature-walks-in-le-chatelard",
    destination: "/europe/france/le-chatelard",
  },
  { source: "/blog/reykjavik", destination: "/europe/iceland/reykjavik" },
  {
    source: "/blog/fashionable-zombie-studio-shoot",
    destination: "/photography/models/fashionable-zombies",
  },
  {
    source: "/blog/modern-art-museum",
    destination: "/europe/united-kingdom/scotland/edinburg",
  },
  { source: "/blog/amman-downtown", destination: "/asia/jordan/amman" },
  {
    source: "/blog/bmws-and-wurmeck-the-dragon",
    destination: "/europe/germany/munich",
  },
  { source: "/blog/patong-market", destination: "/asia/thailand/phuket" },
  {
    source: "/blog/pourquoi-pas-island",
    destination: "/antarctica/pourquoi-pas-island",
  },
  /** Old flat `/{continent}/{place}` URLs missing the country segment. */
  { source: "/europe/meyrin", destination: "/europe/switzerland/meyrin" },
  {
    source: "/europe/vasternorrland/ullanger",
    destination: "/europe/sweden/vasternorrland/ullanger",
  },
  { source: "/utvandraleden", destination: "/hiking/utvandrarleden" },
  /**
   * Greater London content moved from a flat `united-kingdom/greater-london`
   * folder into the correct `england/greater-london` county location.
   */
  {
    source: "/greater-london",
    destination: "/europe/united-kingdom/england/greater-london/london",
  },
  {
    source: "/europe/united-kingdom/greater-london",
    destination: "/europe/united-kingdom/england/greater-london",
  },
  {
    source: "/europe/united-kingdom/greater-london/richmond",
    destination: "/europe/united-kingdom/england/greater-london/richmond",
  },
  /**
   * Legacy “Paróquia da Vera Cruz” link sat under a duplicated `europe` segment;
   * content lives on the Aveiro place page.
   */
  {
    source:
      "/europe/europe/portugal/Par%C3%B3quia%20da%20Vera%20Cruz",
    destination: "/europe/portugal/aveiro",
  },
  /**
   * Place-page renames: fixing typo'd slugs left the old URLs live in search
   * indexes and bookmarks.
   */
  { source: "/europe/portugal/averio", destination: "/europe/portugal/aveiro" },
  {
    source: "/europe/united-kingdom/england/devon/chagford",
    destination: "/europe/united-kingdom/devon/chagford",
  },
  {
    source: "/antarctica/lamaire-channel",
    destination: "/antarctica/lemaire-channel",
  },
];
