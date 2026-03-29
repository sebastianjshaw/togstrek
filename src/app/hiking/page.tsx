import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekHikingPageTemplate } from "@/components/togstrek-hiking/togstrek-hiking-page-template";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import {
  hikingMdxExists,
  loadTogstrekHikingFrontmatterOnly,
  loadTogstrekHikingMdx,
} from "@/lib/togstrek-load-hiking-mdx";

export async function generateMetadata(): Promise<Metadata> {
  if (!hikingMdxExists([])) {
    return { title: "Hiking" };
  }
  const fm = loadTogstrekHikingFrontmatterOnly([]);
  return buildTogstrekMetadata({
    title: fm.title,
    description: fm.description,
    path: "/hiking",
    type: "website",
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

export default async function TogstrekHikingIndexPage() {
  if (!hikingMdxExists([])) {
    notFound();
  }

  const { frontmatter, content, omitDescriptionLead } =
    await loadTogstrekHikingMdx([]);

  return (
    <TogstrekHikingPageTemplate
      variant="hub"
      frontmatter={frontmatter}
      mdxContent={content}
      slugSegments={[]}
      omitDescriptionLead={omitDescriptionLead}
    />
  );
}
