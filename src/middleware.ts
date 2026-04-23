import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

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

function canonicalTogstrekHostname(): string | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!raw) {
    return "www.togstrek.com";
  }
  try {
    return new URL(raw).hostname;
  } catch {
    return "www.togstrek.com";
  }
}

function shouldNormalizeHost(requestHost: string): boolean {
  return requestHost === "togstrek.com" || requestHost === "www.togstrek.com";
}

export function middleware(request: NextRequest) {
  const host =
    request.headers.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    request.headers.get("host") ??
    "";

  const wantHost = canonicalTogstrekHostname();
  if (wantHost && shouldNormalizeHost(host) && host !== wantHost) {
    const u = request.nextUrl.clone();
    u.hostname = wantHost;
    u.protocol = "https:";
    return NextResponse.redirect(u, 308);
  }

  let pathname = request.nextUrl.pathname;
  try {
    pathname = decodeURIComponent(pathname);
  } catch {
    /* keep raw pathname */
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
    /*
     * Run for all pathnames except Next internals and common static assets.
     */
    "/((?!_next/|favicon.ico|robots.txt|sitemap.xml|feed.xml|pagefind/|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|txt|xml|json|webmanifest|woff2)$).*)",
  ],
};
