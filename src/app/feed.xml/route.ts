import { NextResponse } from "next/server";

import {
  buildTogstrekRssDocument,
  parseTogstrekRssQuery,
  togstrekRssCanonicalFeedUrl,
  togstrekRssShouldRedirectToCanonicalFeedUrl,
} from "@/lib/togstrek-rss-feed";

/** ISR window (seconds); must stay a numeric literal for Next.js route config analysis. */
export const revalidate = 86400;

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (togstrekRssShouldRedirectToCanonicalFeedUrl(url)) {
    return NextResponse.redirect(togstrekRssCanonicalFeedUrl(url), 308);
  }
  const q = parseTogstrekRssQuery(url);
  const xml = buildTogstrekRssDocument({
    selfPath: "/feed.xml",
    section: q.section,
    continent: q.continent,
  });
  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control":
        "public, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
