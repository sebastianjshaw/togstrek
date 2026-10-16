import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekPhotographySectionPageTemplate } from "@/components/togstrek-photography/togstrek-photography-section-page-template";
import { TogstrekPhotographyPageTemplate } from "@/components/togstrek-photography/togstrek-photography-page-template";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import {
  loadTogstrekPhotographySectionFrontmatterOnly,
  loadTogstrekPhotographySectionMdx,
  photographySectionMdxExists,
} from "@/lib/togstrek-load-photography-section-mdx";
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

/** `/photography/<collection>` — an Other Work collection with an intro page. */
function isCollectionRoute(slug: string[]): boolean {
  return (
    slug.length === 1 &&
    isTogstrekPhotographyCategorySlug(slug[0]!) &&
    photographySectionMdxExists(slug[0]!)
  );
}

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  const postParams = discoverTogstrekPhotographySlugParams();
  const categoryParams = discoverTogstrekPhotographyCategorySlugs()
    .filter((category) => photographySectionMdxExists(category))
    .map((category) => ({ slug: [category] }));
  return [...categoryParams, ...postParams];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  if (isCollectionRoute(slug)) {
    const category = slug[0]!;
    const fm = loadTogstrekPhotographySectionFrontmatterOnly(category);
    return buildTogstrekMetadata({
      title: fm.title,
      description: fm.description,
      path: `/photography/${category}`,
      type: "website",
      openGraphDescription: fm.description,
      // Width/height intentionally omitted — see togstrek-place-app-route.tsx.
      openGraphImages: fm.heroImage
        ? [{ url: fm.heroImage.src, alt: fm.heroImage.alt }]
        : undefined,
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

  if (isCollectionRoute(slug)) {
    const { frontmatter, content, omitDescriptionLead } =
      await loadTogstrekPhotographySectionMdx(slug[0]!);
    return (
      <TogstrekPhotographySectionPageTemplate
        frontmatter={frontmatter}
        mdxContent={content}
        isHub={false}
        omitDescriptionLead={omitDescriptionLead}
      />
    );
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
