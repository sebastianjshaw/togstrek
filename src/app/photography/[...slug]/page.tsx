import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekPhotographyPageTemplate } from "@/components/togstrek-photography/togstrek-photography-page-template";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import {
  discoverTogstrekPhotographySlugParams,
  loadTogstrekPhotographyFrontmatterOnly,
  loadTogstrekPhotographyMdx,
  photographyMdxExists,
} from "@/lib/togstrek-load-photography-mdx";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return discoverTogstrekPhotographySlugParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!photographyMdxExists(slug)) {
    return { title: "Photography" };
  }
  const fm = loadTogstrekPhotographyFrontmatterOnly(slug);
  const path = `/photography/${slug.join("/")}`;
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

export default async function TogstrekPhotographySlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  if (!photographyMdxExists(slug)) {
    notFound();
  }

  const { frontmatter, content, omitDescriptionLead } =
    await loadTogstrekPhotographyMdx(slug);

  return (
    <TogstrekPhotographyPageTemplate
      frontmatter={frontmatter}
      mdxContent={content}
      slugSegments={slug}
      omitDescriptionLead={omitDescriptionLead}
    />
  );
}
