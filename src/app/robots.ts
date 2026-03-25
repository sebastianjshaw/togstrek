import type { MetadataRoute } from "next";

import { getTogstrekSiteOrigin } from "@/lib/togstrek-site-url";

/**
 * `robots.txt` — allow indexing by default.
 * Set `NEXT_PUBLIC_ROBOTS_NOINDEX=true` on staging/preview to disallow all crawlers.
 */
export default function robots(): MetadataRoute.Robots {
  const base = getTogstrekSiteOrigin();

  if (process.env.NEXT_PUBLIC_ROBOTS_NOINDEX === "true") {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
