import type { Metadata } from "next";

import { togstrekSiteLandingHeroImage } from "@/config/togstrek-media";

export const TOGSTREK_SITE_NAME = "A Tog's Trek";

/** Declared OG / Twitter card dimensions (recommended aspect ~1.91:1). */
export const TOGSTREK_OG_IMAGE_WIDTH = 1200;
export const TOGSTREK_OG_IMAGE_HEIGHT = 630;

/**
 * Public CDN hostname for social previews. Raw `*.r2.dev` bucket URLs often fail
 * link-preview crawlers (WhatsApp, iMessage, Slack); the custom domain serves the
 * same object keys.
 */
const TOGSTREK_SOCIAL_IMAGE_PUBLIC_ORIGIN = "https://media.togstrek.com";

/**
 * Rewrite known R2 public bucket URLs to the canonical media hostname so
 * `og:image` / Twitter cards fetch reliably.
 */
export function togstrekCanonicalSocialImageUrl(imageUrl: string): string {
  try {
    const u = new URL(imageUrl);
    if (u.hostname.endsWith(".r2.dev")) {
      return `${TOGSTREK_SOCIAL_IMAGE_PUBLIC_ORIGIN}${u.pathname}${u.search}`;
    }
  } catch {
    /* keep original */
  }
  return imageUrl;
}

function normalizeOgImage(img: TogstrekOgImage): TogstrekOgImage {
  const url =
    typeof img.url === "string" ? img.url : String(img.url as string | URL);
  return {
    ...img,
    url: togstrekCanonicalSocialImageUrl(url),
  };
}

/** Default OG / Twitter image when a route does not supply `openGraphImages`. */
export function getTogstrekDefaultSocialOgImage(): TogstrekOgImage {
  const hero = togstrekSiteLandingHeroImage();
  return normalizeOgImage({
    url: hero.src,
    width: hero.width,
    height: hero.height,
    alt: hero.alt,
  });
}

/** Matches `title.template` in `app/layout.tsx` (`%s · A Tog's Trek`). */
export const TOGSTREK_METADATA_TITLE_SEPARATOR = " · ";

export type TogstrekOgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export function buildTogstrekDefaultOpenGraphTitle(pageTitle: string): string {
  return `${pageTitle}${TOGSTREK_METADATA_TITLE_SEPARATOR}${TOGSTREK_SITE_NAME}`;
}

export function buildTogstrekMetadata(input: {
  title: string;
  description: string;
  /** Path only, e.g. `/europe` — used for `openGraph.url` and `alternates.canonical`. */
  path?: string;
  type?: "website" | "article";
  /** Defaults to `buildTogstrekDefaultOpenGraphTitle(title)` when omitted. */
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImages?: TogstrekOgImage[];
  /** Visible author metadata (e.g. hiking posts). */
  authors?: Metadata["authors"];
  robots?: Metadata["robots"];
}): Metadata {
  const ogTitle =
    input.openGraphTitle ?? buildTogstrekDefaultOpenGraphTitle(input.title);
  const ogDescription = input.openGraphDescription ?? input.description;

  const authorsList = input.authors
    ? Array.isArray(input.authors)
      ? input.authors
      : [input.authors]
    : [];

  const rawOgImages =
    input.openGraphImages && input.openGraphImages.length > 0
      ? input.openGraphImages
      : [getTogstrekDefaultSocialOgImage()];
  const ogImages = rawOgImages.map(normalizeOgImage);
  const firstImage = ogImages[0];

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  };
  if (firstImage?.url) {
    twitter.images = [
      {
        url: firstImage.url,
        ...(firstImage.alt ? { alt: firstImage.alt } : {}),
        ...(firstImage.width !== undefined ? { width: firstImage.width } : {}),
        ...(firstImage.height !== undefined
          ? { height: firstImage.height }
          : {}),
      },
    ];
  }
  const siteHandle = process.env.NEXT_PUBLIC_TWITTER_SITE?.trim();
  if (siteHandle) {
    twitter.site = siteHandle.startsWith("@") ? siteHandle : `@${siteHandle}`;
  }
  const creatorHandle = process.env.NEXT_PUBLIC_TWITTER_CREATOR?.trim();
  if (creatorHandle) {
    twitter.creator = creatorHandle.startsWith("@")
      ? creatorHandle
      : `@${creatorHandle}`;
  }

  return {
    title: input.title,
    description: input.description,
    ...(input.robots !== undefined ? { robots: input.robots } : {}),
    ...(authorsList.length > 0 ? { authors: authorsList } : {}),
    openGraph: {
      siteName: TOGSTREK_SITE_NAME,
      title: ogTitle,
      description: ogDescription,
      type: input.type ?? "website",
      ...(input.path ? { url: input.path } : {}),
      images: ogImages,
      ...(input.type === "article" && authorsList.length > 0
        ? {
            authors: authorsList
              .map((a) =>
                typeof a === "object" &&
                a !== null &&
                "url" in a &&
                typeof (a as { url?: string }).url === "string"
                  ? (a as { url: string }).url
                  : undefined,
              )
              .filter(
                (u): u is string => typeof u === "string" && u.length > 0,
              ),
          }
        : {}),
    },
    twitter,
    ...(input.path ? { alternates: { canonical: input.path } } : {}),
  };
}
