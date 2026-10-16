import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekPhotographySectionPageTemplate } from "@/components/togstrek-photography/togstrek-photography-section-page-template";
import {
  loadTogstrekPhotographySectionFrontmatterOnly,
  loadTogstrekPhotographySectionMdx,
  photographySectionMdxExists,
} from "@/lib/togstrek-load-photography-section-mdx";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

export async function generateMetadata(): Promise<Metadata> {
  if (!photographySectionMdxExists()) {
    return { title: "Other Work" };
  }
  const fm = loadTogstrekPhotographySectionFrontmatterOnly();
  return buildTogstrekMetadata({
    title: fm.title,
    description: fm.description,
    path: "/photography",
    type: "website",
    openGraphDescription: fm.description,
    // Width/height intentionally omitted — see togstrek-place-app-route.tsx.
    openGraphImages: fm.heroImage
      ? [{ url: fm.heroImage.src, alt: fm.heroImage.alt }]
      : undefined,
  });
}

export default async function TogstrekPhotographyIndexPage() {
  if (!photographySectionMdxExists()) {
    notFound();
  }

  const { frontmatter, content } = await loadTogstrekPhotographySectionMdx();

  return (
    <TogstrekPhotographySectionPageTemplate
      frontmatter={frontmatter}
      mdxContent={content}
      isHub
    />
  );
}
