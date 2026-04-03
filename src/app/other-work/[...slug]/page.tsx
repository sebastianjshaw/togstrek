import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekOtherWorkPageTemplate } from "@/components/togstrek-other-work/togstrek-other-work-page-template";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import {
  discoverTogstrekOtherWorkSlugParams,
  loadTogstrekOtherWorkFrontmatterOnly,
  loadTogstrekOtherWorkMdx,
  otherWorkMdxExists,
} from "@/lib/togstrek-load-other-work-mdx";

export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return discoverTogstrekOtherWorkSlugParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (!otherWorkMdxExists(slug)) {
    return { title: "Other work" };
  }
  const fm = loadTogstrekOtherWorkFrontmatterOnly(slug);
  const path = `/other-work/${slug.join("/")}`;
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

export default async function TogstrekOtherWorkSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  if (!otherWorkMdxExists(slug)) {
    notFound();
  }

  const { frontmatter, content, omitDescriptionLead } =
    await loadTogstrekOtherWorkMdx(slug);

  return (
    <TogstrekOtherWorkPageTemplate
      frontmatter={frontmatter}
      mdxContent={content}
      slugSegments={slug}
      omitDescriptionLead={omitDescriptionLead}
    />
  );
}
