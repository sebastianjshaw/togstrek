import { NextRequest, NextResponse } from "next/server";

import { isTogstrekMediaCdnUrl } from "@/lib/togstrek-cdn-image";
import {
  TOGSTREK_OG_IMAGE_HEIGHT,
  TOGSTREK_OG_IMAGE_WIDTH,
  togstrekOgResizeUrl,
} from "@/lib/togstrek-metadata";

/**
 * Legacy social-preview resize URL. Pages used to point `og:image` here and this
 * route resized the photo with sharp, which counted every response (about 160 KB
 * each) against Vercel's Fast Origin Transfer quota. Pages now point straight at
 * Cloudflare Image Transformations (`togstrekOgResizeUrl`), so this only redirects
 * old URLs that crawlers and chat apps still have cached. It does no image work.
 */

const MAX_DIMENSION = 2000;
const DEFAULT_QUALITY = 80;

function clampInt(value: string | null, fallback: number, max: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

export function GET(request: NextRequest): NextResponse {
  const { searchParams } = new URL(request.url);
  const src = searchParams.get("src");

  if (!src || !isTogstrekMediaCdnUrl(src)) {
    return NextResponse.json(
      { error: "src must be an https URL on the configured media CDN host" },
      { status: 400 },
    );
  }

  const width = clampInt(searchParams.get("w"), TOGSTREK_OG_IMAGE_WIDTH, MAX_DIMENSION);
  const height = clampInt(searchParams.get("h"), TOGSTREK_OG_IMAGE_HEIGHT, MAX_DIMENSION);
  const quality = clampInt(searchParams.get("q"), DEFAULT_QUALITY, 100);

  return NextResponse.redirect(togstrekOgResizeUrl(src, width, height, quality), {
    status: 308,
    headers: { "Cache-Control": "public, max-age=604800, s-maxage=31536000" },
  });
}
