import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekAdventurePageTemplate } from "@/components/togstrek-adventures/togstrek-adventure-page-template";
import {
  TOGSTREK_ADVENTURES_HERO_IMAGE_FILE,
  togstrekAdventuresImage,
} from "@/data/togstrek-adventures-page";
import {
  getTogstrekAboutPathAbsolute,
  TOGSTREK_AUTHOR_NAME,
} from "@/lib/togstrek-author";
import { truncateDescription } from "@/lib/togstrek-geo-labels";
import {
  adventureMdxExists,
  discoverTogstrekAdventureSlugParams,
  loadTogstrekAdventureFrontmatterOnly,
  loadTogstrekAdventureMdx,
} from "@/lib/togstrek-load-adventure-mdx";
import {
  buildTogstrekDefaultOpenGraphTitle,
  buildTogstrekMetadata,
  TOGSTREK_OG_IMAGE_HEIGHT,
  TOGSTREK_OG_IMAGE_WIDTH,
} from "@/lib/togstrek-metadata";

type PageParams = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): PageParams[] {
  return discoverTogstrekAdventureSlugParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!adventureMdxExists(slug)) {
    return { title: "Adventure" };
  }
  const fm = loadTogstrekAdventureFrontmatterOnly(slug);
  const path = `/adventures/${slug}`;
  const description = truncateDescription(fm.description, 165);
  const ogImages = fm.heroImage
    ? [
        {
          url: fm.heroImage.src,
          width: fm.heroImage.width,
          height: fm.heroImage.height,
          alt: fm.heroImage.alt,
        },
      ]
    : [
        {
          url: togstrekAdventuresImage(TOGSTREK_ADVENTURES_HERO_IMAGE_FILE),
          width: TOGSTREK_OG_IMAGE_WIDTH,
          height: TOGSTREK_OG_IMAGE_HEIGHT,
          alt: fm.title,
        },
      ];

  return buildTogstrekMetadata({
    title: fm.title,
    description,
    path,
    type: "article",
    authors: [{ name: TOGSTREK_AUTHOR_NAME, url: getTogstrekAboutPathAbsolute() }],
    openGraphTitle: buildTogstrekDefaultOpenGraphTitle(fm.title),
    openGraphDescription: description,
    openGraphImages: ogImages,
  });
}

export default async function TogstrekAdventureStoryPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  if (!adventureMdxExists(slug)) {
    notFound();
  }

  const { frontmatter, content, omitDescriptionLead } =
    await loadTogstrekAdventureMdx(slug);

  return (
    <TogstrekAdventurePageTemplate
      slug={slug}
      frontmatter={frontmatter}
      mdxContent={content}
      omitDescriptionLead={omitDescriptionLead}
    />
  );
}
