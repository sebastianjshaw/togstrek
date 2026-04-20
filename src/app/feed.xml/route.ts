import { NextResponse } from "next/server";

import {
  buildTogstrekRssDocument,
  parseTogstrekRssQuery,
} from "@/lib/togstrek-rss-feed";

export const revalidate = 3600;

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
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
