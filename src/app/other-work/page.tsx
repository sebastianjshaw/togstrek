import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TogstrekOtherWorkPageTemplate } from "@/components/togstrek-other-work/togstrek-other-work-page-template";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";
import {
  loadTogstrekOtherWorkFrontmatterOnly,
  loadTogstrekOtherWorkMdx,
  otherWorkMdxExists,
} from "@/lib/togstrek-load-other-work-mdx";

export async function generateMetadata(): Promise<Metadata> {
  if (!otherWorkMdxExists([])) {
    return { title: "Other work" };
  }
  const fm = loadTogstrekOtherWorkFrontmatterOnly([]);
  return buildTogstrekMetadata({
    title: fm.title,
    description: fm.description,
    path: "/other-work",
    type: "website",
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

export default async function TogstrekOtherWorkIndexPage() {
  if (!otherWorkMdxExists([])) {
    notFound();
  }

  const { frontmatter, content, omitDescriptionLead } =
    await loadTogstrekOtherWorkMdx([]);

  return (
    <TogstrekOtherWorkPageTemplate
      frontmatter={frontmatter}
      mdxContent={content}
      slugSegments={[]}
      omitDescriptionLead={omitDescriptionLead}
    />
  );
}
