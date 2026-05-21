import type { ReactNode } from "react";

import { TogstrekArticlePageTemplate } from "@/components/togstrek-article/togstrek-article-page-template";
import type { TogstrekPageHeroQuote } from "@/components/togstrek-page-hero";
import type { TogstrekOtherWorkMdxFrontmatter } from "@/lib/togstrek-other-work-frontmatter";

type TogstrekOtherWorkPageTemplateProps = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
  mdxContent: ReactNode;
  /** URL segments under `/other-work` (empty on the hub). */
  slugSegments: string[];
  /** Hide YAML `description` lead on article pages when it duplicates the body opening. */
  omitDescriptionLead?: boolean;
};

export function TogstrekOtherWorkPageTemplate({
  frontmatter,
  mdxContent,
  slugSegments,
  omitDescriptionLead = false,
}: TogstrekOtherWorkPageTemplateProps) {
  const isHub = slugSegments.length === 0;

  const hubHeroQuote: TogstrekPageHeroQuote | undefined =
    isHub && frontmatter.heroQuote
      ? {
          children: frontmatter.heroQuote,
          ...(frontmatter.heroQuoteAttribution
            ? { attribution: frontmatter.heroQuoteAttribution }
            : {}),
        }
      : undefined;

  const breadcrumbItems = isHub
    ? [{ label: frontmatter.title }]
    : [
        { href: "/other-work", label: "Other work" },
        { label: frontmatter.title },
      ];

  return (
    <TogstrekArticlePageTemplate
      pageClassName="togstrek-other-work-page"
      title={frontmatter.title}
      description={frontmatter.description}
      published={frontmatter.published}
      modified={frontmatter.modified}
      heroImage={frontmatter.heroImage}
      heroQuote={hubHeroQuote}
      eyebrow={isHub ? "Portfolio" : "Other work"}
      heroTitleId="togstrek-other-work-hero-title"
      fallbackTitleId="togstrek-other-work-title"
      breadcrumbItems={breadcrumbItems}
      mdxContent={mdxContent}
      omitDescriptionLead={omitDescriptionLead}
      isHub={isHub}
    />
  );
}
