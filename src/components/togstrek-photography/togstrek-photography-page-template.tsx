import type { ReactNode } from "react";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekDescriptionLead } from "@/components/togstrek-ui/togstrek-description-lead";
import { TogstrekPublishedDate } from "@/components/togstrek-ui/togstrek-published-date";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import { TogstrekPageHeroFallbackHeader } from "@/components/togstrek-ui/togstrek-page-hero-fallback-header";
import { buildTogstrekPhotographyBreadcrumbItems } from "@/lib/togstrek-photography-nav";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
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
  const showDescriptionLead =
    Boolean(frontmatter.description) && !omitDescriptionLead;

  const breadcrumbItems = buildTogstrekPhotographyBreadcrumbItems(
    slugSegments,
    frontmatter.title,
  );

  return (
    <main className="togstrek-photography-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow="Photography"
          title={frontmatter.title}
          titleId="togstrek-photography-hero-title"
        />
      ) : (
        <TogstrekPageHeroFallbackHeader
          title={frontmatter.title}
          titleId="togstrek-photography-title"
        />
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        {showDescriptionLead ? (
          <TogstrekDescriptionLead>{frontmatter.description}</TogstrekDescriptionLead>
        ) : null}

        <TogstrekPublishedDate
          published={frontmatter.published}
          modified={frontmatter.modified}
          descriptionLeadShown={showDescriptionLead}
        />

        <TogstrekMdxLightboxScope>
          <article className="togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-12)]">
            {mdxContent}
          </article>
        </TogstrekMdxLightboxScope>
      </TogstrekContentWidth>
    </main>
  );
}
