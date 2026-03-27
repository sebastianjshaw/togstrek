import type { MetadataRoute } from "next";

import { discoverTogstrekHikingGroupSegmentLists } from "@/lib/togstrek-hiking-groups";
import { discoverTogstrekHikingSlugLists } from "@/lib/togstrek-load-hiking-mdx";
import { discoverTogstrekOtherWorkSlugLists } from "@/lib/togstrek-load-other-work-mdx";
import { discoverTogstrekPhotographySlugLists } from "@/lib/togstrek-load-photography-mdx";
import {
  discoverTogstrekCountryHubParams,
  discoverTogstrekPlaceSlugs,
} from "@/lib/togstrek-load-place-mdx";
import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

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
  ];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getTogstrekSiteOrigin();
  const lastModified = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFrequency }) => ({
      url: path === "/" ? `${base}/` : `${base}${path}`,
      lastModified,
      changeFrequency,
      priority,
    }),
  );

  const countryHubEntries: MetadataRoute.Sitemap =
    discoverTogstrekCountryHubParams().map(({ continent, country }) => ({
      url: `${base}/${continent}/${country}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.74,
    }));

  const placeEntries: MetadataRoute.Sitemap = discoverTogstrekPlaceSlugs().map(
    ({ continent, country, place }) => ({
      url: `${base}/${continent}/${country}/${place}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }),
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
      return {
        url:
          segments.length === 0
            ? `${base}/hiking`
            : `${base}/hiking/${segments.join("/")}`,
        lastModified,
        changeFrequency: "monthly" as const,
        priority: segments.length === 0 ? 0.85 : 0.72,
      };
    },
  );

  const otherWorkEntries: MetadataRoute.Sitemap =
    discoverTogstrekOtherWorkSlugLists().map((segments) => ({
      url:
        segments.length === 0
          ? `${base}/other-work`
          : `${base}/other-work/${segments.join("/")}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: segments.length === 0 ? 0.84 : 0.7,
    }));

  const photographyEntries: MetadataRoute.Sitemap =
    discoverTogstrekPhotographySlugLists().map((segments) => ({
      url: `${base}/photography/${segments.join("/")}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.68,
    }));

  return [
    ...staticEntries,
    ...countryHubEntries,
    ...placeEntries,
    ...hikingEntries,
    ...otherWorkEntries,
    ...photographyEntries,
  ];
}
