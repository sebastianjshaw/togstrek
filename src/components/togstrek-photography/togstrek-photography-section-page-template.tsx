import type { ReactNode } from "react";

import { TogstrekArticlePageTemplate } from "@/components/togstrek-article/togstrek-article-page-template";
import type { TogstrekPageHeroQuote } from "@/components/togstrek-page-hero";
import type { TogstrekPhotographyMdxFrontmatter } from "@/lib/togstrek-photography-frontmatter";

type TogstrekPhotographySectionPageTemplateProps = {
  frontmatter: TogstrekPhotographyMdxFrontmatter;
  mdxContent: ReactNode;
  /** `true` on the Other Work hub (`/photography`), `false` on a collection page. */
  isHub: boolean;
  /** Hide the YAML `description` lead when it duplicates the body opening. */
  omitDescriptionLead?: boolean;
};

/** Other Work hub and collection pages (Art Nude, Events, …). */
export function TogstrekPhotographySectionPageTemplate({
  frontmatter,
  mdxContent,
  isHub,
  omitDescriptionLead = false,
}: TogstrekPhotographySectionPageTemplateProps) {
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
        { href: "/photography", label: "Other Work" },
        { label: frontmatter.title },
      ];

  return (
    <TogstrekArticlePageTemplate
      pageClassName="togstrek-photography-section-page"
      title={frontmatter.title}
      description={frontmatter.description}
      published={frontmatter.published}
      modified={frontmatter.modified}
      heroImage={frontmatter.heroImage}
      heroQuote={hubHeroQuote}
      eyebrow={isHub ? "Portfolio" : "Other Work"}
      heroTitleId="togstrek-photography-section-hero-title"
      fallbackTitleId="togstrek-photography-section-title"
      breadcrumbItems={breadcrumbItems}
      mdxContent={mdxContent}
      omitDescriptionLead={omitDescriptionLead}
      isHub={isHub}
    />
  );
}
