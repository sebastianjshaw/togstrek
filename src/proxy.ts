import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  togstrekRssCanonicalFeedUrl,
  togstrekRssShouldRedirectToCanonicalFeedUrl,
} from "@/lib/togstrek-rss-feed";

/**
 * Antarctic legacy `/antarctica/category/<human title>` (spaces, mixed case).
 * Keys are normalised with {@link normaliseAntarcticaCategoryKey}.
 */
const TOGSTREK_ANTARCTICA_CATEGORY_TITLE_TO_SLUG: Record<string, string> = {
  "yalour islands": "yalour-islands",
  "jenny island": "jenny-island",
  "the gullet": "the-gullet",
  "pourquoi pas island": "pourquoi-pas-island",
};

function normaliseAntarcticaCategoryKey(raw: string): string {
  return raw
    .normalize("NFC")
    .replace(/\+/g, " ")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function slugifyLooseTitle(title: string): string {
  return normaliseAntarcticaCategoryKey(title).replace(/\s/g, "-");
}

export function proxy(request: NextRequest) {
  const feedPath = request.nextUrl.pathname.replace(/\/+$/, "") || "/";
  if (feedPath === "/feed.xml" || feedPath === "/rss.xml") {
    const u = request.nextUrl.clone();
    if (togstrekRssShouldRedirectToCanonicalFeedUrl(u)) {
      const canon = togstrekRssCanonicalFeedUrl(u);
      u.pathname = canon.pathname;
      u.search = canon.search;
      return NextResponse.redirect(u, 308);
    }
  }

  let pathname = request.nextUrl.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    /* keep raw pathname */
  }

  /**
   * Vercel Image Optimization endpoint.
   *
   * Even with `images.unoptimized = true`, bots can hammer `/_next/image` directly and
   * burn through “Image Optimization” quotas. Return 410 before the handler runs.
   */
  if (pathname === "/_next/image") {
    return new NextResponse("Gone", { status: 410 });
  }

  /** Hub URLs without a trailing slash (matches canonical paths). */
  const pathNorm = pathname.replace(/\/+$/, "") || "/";

  const categoryMatch = pathname.match(/^\/antarctica\/category\/(.+)$/i);
  if (categoryMatch) {
    const title = categoryMatch[1] ?? "";
    const key = normaliseAntarcticaCategoryKey(title);
    const slug =
      TOGSTREK_ANTARCTICA_CATEGORY_TITLE_TO_SLUG[key] ?? slugifyLooseTitle(title);
    const u = request.nextUrl.clone();
    u.pathname = `/antarctica/${slug}`;
    u.search = "";
    return NextResponse.redirect(u, 308);
  }

  const params = request.nextUrl.searchParams;
  const nextParams = new URLSearchParams(params.toString());
  let changed = false;

  if (nextParams.get("format") === "amp") {
    nextParams.delete("format");
    changed = true;
  }

  if (nextParams.has("insta") && pathNorm === "/") {
    nextParams.delete("insta");
    changed = true;
  }

  const continentHub =
    /^\/(?:africa|antarctica|asia|europe|north-america|oceania|south-america)$/;
  if (continentHub.test(pathNorm)) {
    if (nextParams.has("offset")) {
      nextParams.delete("offset");
      changed = true;
    }
    if (pathNorm === "/asia" && nextParams.has("category")) {
      const raw = nextParams.get("category")?.trim() ?? "";
      nextParams.delete("category");
      changed = true;
      if (raw) {
        const countrySlug = raw
          .normalize("NFC")
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "-");
        const u = request.nextUrl.clone();
        u.pathname = `/asia/${countrySlug}`;
        u.search = nextParams.toString() ? `?${nextParams.toString()}` : "";
        return NextResponse.redirect(u, 308);
      }
    }
  }

  if (changed) {
    const u = request.nextUrl.clone();
    if (continentHub.test(pathNorm)) {
      u.pathname = pathNorm;
    }
    u.search = nextParams.toString() ? `?${nextParams.toString()}` : "";
    if (u.toString() !== request.nextUrl.toString()) {
      return NextResponse.redirect(u, 308);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/_next/image",
    "/feed.xml",
    "/rss.xml",
    "/antarctica/category/:path*",
    "/",
    "/:continent(africa|antarctica|asia|europe|north-america|oceania|south-america)",
  ],
};

