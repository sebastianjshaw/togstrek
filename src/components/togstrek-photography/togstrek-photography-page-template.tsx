import type { ReactNode } from "react";

import { TogstrekArticlePageTemplate } from "@/components/togstrek-article/togstrek-article-page-template";
import { buildTogstrekPhotographyBreadcrumbItems } from "@/lib/togstrek-photography-nav";
import type { TogstrekPhotographyMdxFrontmatter } from "@/lib/togstrek-photography-frontmatter";

type TogstrekPhotographyPageTemplateProps = {
  frontmatter: TogstrekPhotographyMdxFrontmatter;
  mdxContent: ReactNode;
  slugSegments: string[];
  /** Hide YAML `description` above the article when it duplicates the body opening. */
  omitDescriptionLead?: boolean;
};

export function TogstrekPhotographyPageTemplate({
  frontmatter,
  mdxContent,
  slugSegments,
  omitDescriptionLead = false,
}: TogstrekPhotographyPageTemplateProps) {
  return (
    <TogstrekArticlePageTemplate
      pageClassName="togstrek-photography-page"
      title={frontmatter.title}
      description={frontmatter.description}
      published={frontmatter.published}
      modified={frontmatter.modified}
      heroImage={frontmatter.heroImage}
      eyebrow="Other Work"
      heroTitleId="togstrek-photography-hero-title"
      fallbackTitleId="togstrek-photography-title"
      breadcrumbItems={buildTogstrekPhotographyBreadcrumbItems(
        slugSegments,
        frontmatter.title,
      )}
      mdxContent={mdxContent}
      omitDescriptionLead={omitDescriptionLead}
    />
  );
}
