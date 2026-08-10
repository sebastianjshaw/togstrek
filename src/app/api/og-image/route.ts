import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

import { isTogstrekMediaCdnUrl } from "@/lib/togstrek-cdn-image";
import { TOGSTREK_OG_IMAGE_HEIGHT, TOGSTREK_OG_IMAGE_WIDTH } from "@/lib/togstrek-metadata";

/**
 * Resizes a `media.togstrek.com` photo to social-preview dimensions.
 *
 * Cloudflare Image Resizing and Vercel's built-in `/next/image` optimizer are
 * both unavailable here (see `togstrek-cdn-image.ts` / `next.config.ts`), so
 * `og:image` / `twitter:image` otherwise point straight at multi-megabyte
 * originals — WhatsApp's link-preview crawler in particular gives up on those
 * and renders no image at all. This runs on ordinary Vercel Function compute
 * (not the metered Image Optimization product) and is cached hard, so repeat
 * crawler hits cost nothing after the first.
 */

export const runtime = "nodejs";

const MAX_DIMENSION = 2000;
const DEFAULT_QUALITY = 80;
const UPSTREAM_FETCH_TIMEOUT_MS = 8_000;

function clampInt(value: string | null, fallback: number, max: number): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, max);
}

export async function GET(request: NextRequest): Promise<NextResponse> {
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_FETCH_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(src, { signal: controller.signal });
  } catch {
    return NextResponse.json({ error: "Failed to fetch source image" }, { status: 502 });
  } finally {
    clearTimeout(timeout);
  }

  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Source image responded with ${upstream.status}` },
      { status: 502 },
    );
  }

  const inputBuffer = Buffer.from(await upstream.arrayBuffer());

  let outputBuffer: Buffer;
  try {
    outputBuffer = await sharp(inputBuffer)
      .resize(width, height, { fit: "cover", position: "attention" })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
  } catch {
    return NextResponse.json({ error: "Failed to process image" }, { status: 500 });
  }

  return new NextResponse(new Uint8Array(outputBuffer), {
    status: 200,
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=604800, s-maxage=31536000, stale-while-revalidate=86400",
    },
  });
}
