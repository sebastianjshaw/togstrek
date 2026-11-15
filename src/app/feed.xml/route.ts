import { NextResponse } from "next/server";

import {
  buildTogstrekRssDocument,
  parseTogstrekRssQuery,
} from "@/lib/togstrek-rss-feed";

/** Regenerate feeds on deploy only — avoids daily ISR origin work. */
export const revalidate = false;

// Non-canonical paths and query strings are redirected by `src/proxy.ts` before this runs.
export async function GET(request: Request) {
  const url = new URL(request.url);
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
