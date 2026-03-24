import type { MetadataRoute } from "next";

import { discoverTogstrekPlaceSlugs } from "@/lib/togstrek-load-place-mdx";
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

  const placeEntries: MetadataRoute.Sitemap = discoverTogstrekPlaceSlugs().map(
    ({ continent, country, place }) => ({
      url: `${base}/${continent}/${country}/${place}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }),
  );

  return [...staticEntries, ...placeEntries];
}
