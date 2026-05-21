import type { ReactNode } from "react";

import { TogstrekArticlePageTemplate } from "@/components/togstrek-article/togstrek-article-page-template";
import { buildTogstrekPhotographyBreadcrumbItems } from "@/lib/togstrek-photography-nav";
import type { TogstrekOtherWorkMdxFrontmatter } from "@/lib/togstrek-other-work-frontmatter";

type TogstrekPhotographyPageTemplateProps = {
  frontmatter: TogstrekOtherWorkMdxFrontmatter;
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
      eyebrow="Photography"
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
