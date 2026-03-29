import type { Metadata } from "next";

export const TOGSTREK_SITE_NAME = "A Tog's Trek";

/** Declared OG / Twitter card dimensions (recommended aspect ~1.91:1). */
export const TOGSTREK_OG_IMAGE_WIDTH = 1200;
export const TOGSTREK_OG_IMAGE_HEIGHT = 630;

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
}): Metadata {
  const ogTitle =
    input.openGraphTitle ?? buildTogstrekDefaultOpenGraphTitle(input.title);
  const ogDescription = input.openGraphDescription ?? input.description;

  const authorsList = input.authors
    ? Array.isArray(input.authors)
      ? input.authors
      : [input.authors]
    : [];

  const firstImage = input.openGraphImages?.[0];

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: "summary_large_image",
    title: ogTitle,
    description: ogDescription,
  };
  if (firstImage?.url) {
    twitter.images = [firstImage.url];
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
    ...(authorsList.length > 0 ? { authors: authorsList } : {}),
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: input.type ?? "website",
      ...(input.path ? { url: input.path } : {}),
      ...(input.openGraphImages?.length
        ? { images: input.openGraphImages }
        : {}),
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
