import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekHikingPageTemplate } from "@/components/togstrek-hiking/togstrek-hiking-page-template";
import {
  getTogstrekAboutPathAbsolute,
  TOGSTREK_AUTHOR_NAME,
} from "@/lib/togstrek-author";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import { buildSyntheticGroupFrontmatter } from "@/lib/togstrek-hiking-hub-entries";
import {
  hikingMdxExists,
  loadTogstrekHikingFrontmatterOnly,
  loadTogstrekHikingMdx,
  resolveTogstrekHikingRoute,
  discoverTogstrekHikingSlugParams,
} from "@/lib/togstrek-load-hiking-mdx";

/** Only prebuilt slugs — keeps the route fully static on Vercel (smaller serverless trace). */
export const dynamicParams = false;

export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
  return discoverTogstrekHikingSlugParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const route = resolveTogstrekHikingRoute(slug);
  if (!route) {
    return { title: "Hiking" };
  }

  const path = `/hiking/${slug.join("/")}`;

  if (route.kind === "post") {
    const fm = loadTogstrekHikingFrontmatterOnly(slug);
    return buildTogstrekMetadata({
      title: fm.title,
      description: fm.description,
      path,
      type: "article",
      authors: [{ name: TOGSTREK_AUTHOR_NAME, url: getTogstrekAboutPathAbsolute() }],
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

  let title: string;
  let description: string;
  if (hikingMdxExists(slug)) {
    const fm = loadTogstrekHikingFrontmatterOnly(slug);
    title = fm.title;
    description = fm.description;
  } else {
    const copy = buildSyntheticGroupFrontmatter(route.groupSegments);
    title = copy.title;
    description = copy.description;
  }

  return buildTogstrekMetadata({
    title,
    description,
    path,
    type: "website",
    openGraphDescription: description,
  });
}

export default async function TogstrekHikingPostPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const route = resolveTogstrekHikingRoute(slug);
  if (!route) {
    notFound();
  }

  if (route.kind === "post") {
    const { frontmatter, content, omitDescriptionLead } =
      await loadTogstrekHikingMdx(slug);
    return (
      <TogstrekHikingPageTemplate
        variant="post"
        frontmatter={frontmatter}
        mdxContent={content}
        slugSegments={slug}
        omitDescriptionLead={omitDescriptionLead}
      />
    );
  }

  if (hikingMdxExists(slug)) {
    const { frontmatter, content, omitDescriptionLead } =
      await loadTogstrekHikingMdx(slug);
    return (
      <TogstrekHikingPageTemplate
        variant="group"
        frontmatter={frontmatter}
        mdxContent={content}
        slugSegments={route.groupSegments}
        omitDescriptionLead={omitDescriptionLead}
      />
    );
  }

  const fm = buildSyntheticGroupFrontmatter(route.groupSegments);
  return (
    <TogstrekHikingPageTemplate
      variant="group"
      frontmatter={{
        title: fm.title,
        description: fm.description,
      }}
      mdxContent={null}
      slugSegments={route.groupSegments}
    />
  );
}
