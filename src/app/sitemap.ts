import type { MetadataRoute } from "next";

import { discoverTogstrekHikingGroupSegmentLists } from "@/lib/togstrek-hiking-groups";
import { discoverTogstrekHikingSlugLists } from "@/lib/togstrek-hiking-content-fs";
import { discoverTogstrekOtherWorkSlugLists } from "@/lib/togstrek-load-other-work-mdx";
import { discoverTogstrekPhotographySlugLists } from "@/lib/togstrek-load-photography-mdx";
import {
  discoverTogstrekCountryHubParams,
  discoverTogstrekPlaceSlugs,
} from "@/lib/togstrek-load-place-mdx";
import {
  togstrekSitemapLastModifiedForCountryHub,
  togstrekSitemapLastModifiedForHiking,
  togstrekSitemapLastModifiedForOtherWork,
  togstrekSitemapLastModifiedForPhotography,
  togstrekSitemapLastModifiedForPlace,
} from "@/lib/togstrek-sitemap-last-modified";
import { togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";
import { discoverEnglandCountyHubParams } from "@/lib/togstrek-england-counties";
import { discoverTogstrekUkNationHubParams } from "@/lib/togstrek-uk-nations";
import { listSortedTogstrekAdventureArchiveItems } from "@/lib/togstrek-adventure-content-fs";

type SitemapChangeFrequency = NonNullable<
  MetadataRoute.Sitemap[number]["changeFrequency"]
>;

/** Indexable static routes (see `robots.ts` for disallowed paths). */
const STATIC_PATHS: {
  path: string;
  priority: number;
  changeFrequency: SitemapChangeFrequency;
}[] = [
    { path: "/", priority: 1, changeFrequency: "weekly" },
    { path: "/about", priority: 0.85, changeFrequency: "monthly" },
    { path: "/adventures", priority: 0.9, changeFrequency: "weekly" },
    { path: "/europe", priority: 0.85, changeFrequency: "weekly" },
    { path: "/africa", priority: 0.85, changeFrequency: "weekly" },
    { path: "/asia", priority: 0.85, changeFrequency: "weekly" },
    { path: "/north-america", priority: 0.85, changeFrequency: "weekly" },
    { path: "/south-america", priority: 0.85, changeFrequency: "weekly" },
    { path: "/oceania", priority: 0.85, changeFrequency: "weekly" },
    { path: "/antarctica", priority: 0.85, changeFrequency: "weekly" },
    { path: "/contact", priority: 0.55, changeFrequency: "yearly" },
    { path: "/copyright", priority: 0.45, changeFrequency: "yearly" },
    { path: "/search", priority: 0.65, changeFrequency: "monthly" },
  ];

function withOptionalLastModified(
  entry: MetadataRoute.Sitemap[number],
  lastModified: Date | undefined,
): MetadataRoute.Sitemap[number] {
  if (!lastModified) return entry;
  return { ...entry, lastModified };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getTogstrekSiteOrigin();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFrequency }) => ({
      url: path === "/" ? `${base}/` : `${base}${path}`,
      changeFrequency,
      priority,
    }),
  );

  const adventureStoryEntries: MetadataRoute.Sitemap =
    listSortedTogstrekAdventureArchiveItems().map((item) => ({
      url: `${base}${item.href}`,
      changeFrequency: "yearly" as const,
      priority: 0.72,
    }));

  const countryHubEntries: MetadataRoute.Sitemap =
    discoverTogstrekCountryHubParams().map(({ continent, country }) =>
      withOptionalLastModified(
        {
          url: `${base}/${continent}/${country}`,
          changeFrequency: "monthly" as const,
          priority: 0.74,
        },
        togstrekSitemapLastModifiedForCountryHub(continent, country),
      ),
    );

  const placeEntries: MetadataRoute.Sitemap = discoverTogstrekPlaceSlugs().map(
    ({ continent, country, place }) => {
      const tail = togstrekPlacePathFromSegments(place);
      return withOptionalLastModified(
        {
          url: `${base}/${continent}/${country}/${tail}`,
          changeFrequency: "monthly" as const,
          priority: 0.75,
        },
        togstrekSitemapLastModifiedForPlace(continent, country, place),
      );
    },
  );

  const ukNationHubEntries: MetadataRoute.Sitemap =
    discoverTogstrekUkNationHubParams().map(({ continent, country, place }) =>
      withOptionalLastModified(
        {
          url: `${base}/${continent}/${country}/${place[0]}`,
          changeFrequency: "monthly" as const,
          priority: 0.73,
        },
        togstrekSitemapLastModifiedForCountryHub(continent, country),
      ),
    );

  const englandCountyHubEntries: MetadataRoute.Sitemap =
    discoverEnglandCountyHubParams().map(({ continent, country, place }) =>
      withOptionalLastModified(
        {
          url: `${base}/${continent}/${country}/${place.join("/")}`,
          changeFrequency: "monthly" as const,
          priority: 0.72,
        },
        togstrekSitemapLastModifiedForCountryHub(continent, country),
      ),
    );

  const hikingSlugKey = (segments: string[]) => JSON.stringify(segments);
  const hikingSlugSet = new Set<string>();
  for (const s of discoverTogstrekHikingSlugLists()) {
    hikingSlugSet.add(hikingSlugKey(s));
  }
  for (const g of discoverTogstrekHikingGroupSegmentLists()) {
    hikingSlugSet.add(hikingSlugKey(g));
  }

  const hikingEntries: MetadataRoute.Sitemap = [...hikingSlugSet].map(
    (key) => {
      const segments = JSON.parse(key) as string[];
      return withOptionalLastModified(
        {
          url:
            segments.length === 0
              ? `${base}/hiking`
              : `${base}/hiking/${segments.join("/")}`,
          changeFrequency: "monthly" as const,
          priority: segments.length === 0 ? 0.85 : 0.72,
        },
        togstrekSitemapLastModifiedForHiking(segments),
      );
    },
  );

  const otherWorkEntries: MetadataRoute.Sitemap =
    discoverTogstrekOtherWorkSlugLists().map((segments) =>
      withOptionalLastModified(
        {
          url:
            segments.length === 0
              ? `${base}/other-work`
              : `${base}/other-work/${segments.join("/")}`,
          changeFrequency: "monthly" as const,
          priority: segments.length === 0 ? 0.84 : 0.7,
        },
        togstrekSitemapLastModifiedForOtherWork(segments),
      ),
    );

  const photographyEntries: MetadataRoute.Sitemap =
    discoverTogstrekPhotographySlugLists().map((segments) =>
      withOptionalLastModified(
        {
          url: `${base}/photography/${segments.join("/")}`,
          changeFrequency: "monthly" as const,
          priority: 0.68,
        },
        togstrekSitemapLastModifiedForPhotography(segments),
      ),
    );

  return [
    ...staticEntries,
    ...adventureStoryEntries,
    ...countryHubEntries,
    ...ukNationHubEntries,
    ...englandCountyHubEntries,
    ...placeEntries,
    ...hikingEntries,
    ...otherWorkEntries,
    ...photographyEntries,
  ];
}
