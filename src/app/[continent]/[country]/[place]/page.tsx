import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekPlacePageTemplate } from "@/components/togstrek-place/togstrek-place-page-template";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import {
  discoverTogstrekPlaceSlugs,
  loadTogstrekPlaceFrontmatterOnly,
  loadTogstrekPlaceMdx,
  togstrekPlaceMdxExists,
} from "@/lib/togstrek-load-place-mdx";

type PageParams = { continent: string; country: string; place: string };

export async function generateStaticParams(): Promise<PageParams[]> {
  return discoverTogstrekPlaceSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { continent, country, place } = await params;
  if (!togstrekPlaceMdxExists(continent, country, place)) {
    return { title: "Place" };
  }
  const fm = loadTogstrekPlaceFrontmatterOnly(continent, country, place);
  const path = `/${continent}/${country}/${place}`;

  return buildTogstrekMetadata({
    title: fm.title,
    description: fm.description,
    path,
    type: "article",
    openGraphDescription: fm.description,
    openGraphImages: fm.heroImage
      ? [
          {
            url: fm.heroImage.src,
            width: fm.heroImage.width,
            height: fm.heroImage.height,
            alt: fm.heroImage.alt,
          },
        ]
      : undefined,
  });
}

export default async function TogstrekPlacePage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { continent, country, place } = await params;
  if (!togstrekPlaceMdxExists(continent, country, place)) {
    notFound();
  }

  const { frontmatter, content } = await loadTogstrekPlaceMdx(
    continent,
    country,
    place,
  );

  return (
    <TogstrekPlacePageTemplate
      frontmatter={frontmatter}
      mdxContent={content}
      path={{ continent, country, place }}
    />
  );
}
