import type { Metadata } from "next";

const SITE_NAME = "A Tog's Trek";

export type TogstrekOgImage = {
  url: string;
  width?: number;
  height?: number;
  alt?: string;
};

export function buildTogstrekMetadata(input: {
  title: string;
  description: string;
  /** Path only, e.g. `/europe` — used for `openGraph.url` and `alternates.canonical`. */
  path?: string;
  type?: "website" | "article";
  /** Defaults to `${title} — ${SITE_NAME}` when omitted. */
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImages?: TogstrekOgImage[];
}): Metadata {
  const ogTitle = input.openGraphTitle ?? `${input.title} — ${SITE_NAME}`;
  const ogDescription = input.openGraphDescription ?? input.description;

  return {
    title: input.title,
    description: input.description,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      type: input.type ?? "website",
      ...(input.path ? { url: input.path } : {}),
      ...(input.openGraphImages?.length
        ? { images: input.openGraphImages }
        : {}),
    },
    ...(input.path ? { alternates: { canonical: input.path } } : {}),
  };
}
