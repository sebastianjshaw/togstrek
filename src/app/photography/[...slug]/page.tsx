import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekPhotographyCategoryPage } from "@/components/togstrek-photography/togstrek-photography-category-page";
import { TogstrekPhotographyPageTemplate } from "@/components/togstrek-photography/togstrek-photography-page-template";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import {
  discoverTogstrekPhotographySlugParams,
  loadTogstrekPhotographyFrontmatterOnly,
  loadTogstrekPhotographyMdx,
  photographyMdxExists,
} from "@/lib/togstrek-load-photography-mdx";
import {
  discoverTogstrekPhotographyCategorySlugs,
  isTogstrekPhotographyCategorySlug,
} from "@/lib/togstrek-photography-nav";

export const dynamicParams = false;

function formatCategoryTitle(category: string): string {
  return category
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const postParams = discoverTogstrekPhotographySlugParams();
  const categoryParams = discoverTogstrekPhotographyCategorySlugs().map(
    (category) => ({ slug: [category] }),
  );
  return [...categoryParams, ...postParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (
    slug.length === 1 &&
    isTogstrekPhotographyCategorySlug(slug[0]!)
  ) {
    const category = slug[0]!;
    return buildTogstrekMetadata({
      title: formatCategoryTitle(category),
      description: `Photo essays in the ${formatCategoryTitle(category)} collection.`,
      path: `/photography/${category}`,
      type: "website",
    });
  }

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
    // Width/height intentionally omitted — see togstrek-place-app-route.tsx.
    openGraphImages: fm.heroImage
      ? [
          {
            url: fm.heroImage.src,
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

  if (
    slug.length === 1 &&
    isTogstrekPhotographyCategorySlug(slug[0]!)
  ) {
    return <TogstrekPhotographyCategoryPage category={slug[0]!} />;
  }

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
