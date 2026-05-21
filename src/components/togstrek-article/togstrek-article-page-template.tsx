import type { ReactNode } from "react";

import { TogstrekPageHero, type TogstrekPageHeroQuote } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekDescriptionLead } from "@/components/togstrek-ui/togstrek-description-lead";
import { TogstrekPublishedDate } from "@/components/togstrek-ui/togstrek-published-date";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import { TogstrekPageHeroFallbackHeader } from "@/components/togstrek-ui/togstrek-page-hero-fallback-header";
import { togstrekMainLandmarkProps } from "@/lib/togstrek-main-landmark";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import type { TogstrekImageAsset } from "@/types/togstrek-place-page";

export type TogstrekArticleBreadcrumbItem = {
  href?: string;
  label: string;
};

export type TogstrekArticlePageTemplateProps = {
  pageClassName: string;
  title: string;
  description?: string;
  published?: string;
  modified?: string;
  heroImage?: TogstrekImageAsset;
  heroQuote?: TogstrekPageHeroQuote;
  eyebrow: string;
  fallbackEyebrow?: string;
  heroTitleId: string;
  fallbackTitleId: string;
  breadcrumbItems: TogstrekArticleBreadcrumbItem[];
  mdxContent: ReactNode;
  omitDescriptionLead?: boolean;
  /** Hub/index pages: no published line, wider prose spacing. */
  isHub?: boolean;
  /** Rendered inside `<main>` before the hero (e.g. JSON-LD). */
  headSlot?: ReactNode;
  /** Rendered after the MDX article inside the content column. */
  afterArticle?: ReactNode;
  articleClassName?: string;
};

const DEFAULT_ARTICLE_CLASSNAME =
  "togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-12)]";

export function TogstrekArticlePageTemplate({
  pageClassName,
  title,
  description,
  published,
  modified,
  heroImage,
  heroQuote,
  eyebrow,
  fallbackEyebrow,
  heroTitleId,
  fallbackTitleId,
  breadcrumbItems,
  mdxContent,
  omitDescriptionLead = false,
  isHub = false,
  headSlot,
  afterArticle,
  articleClassName = DEFAULT_ARTICLE_CLASSNAME,
}: TogstrekArticlePageTemplateProps) {
  const showDescriptionLead =
    !isHub && Boolean(description) && !omitDescriptionLead;
  const resolvedArticleClassName = isHub
    ? "togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-8)] max-w-none"
    : articleClassName;

  return (
    <main
      {...togstrekMainLandmarkProps}
      className={`${pageClassName} w-full min-w-0 flex-1 [overflow-wrap:anywhere]`}
    >
      {headSlot}

      {heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={heroImage.src}
          imageAlt={heroImage.alt}
          imageWidth={heroImage.width}
          imageHeight={heroImage.height}
          imagePriority={heroImage.priority}
          eyebrow={eyebrow}
          title={title}
          titleId={heroTitleId}
          quote={heroQuote}
        />
      ) : (
        <TogstrekPageHeroFallbackHeader
          eyebrow={fallbackEyebrow ?? eyebrow}
          title={title}
          titleId={fallbackTitleId}
        />
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        {showDescriptionLead ? (
          <TogstrekDescriptionLead>{description}</TogstrekDescriptionLead>
        ) : null}

        {!isHub ? (
          <TogstrekPublishedDate
            published={published}
            modified={modified}
            descriptionLeadShown={showDescriptionLead}
          />
        ) : null}

        <TogstrekMdxLightboxScope>
          <article className={resolvedArticleClassName}>{mdxContent}</article>
        </TogstrekMdxLightboxScope>

        {afterArticle}
      </TogstrekContentWidth>
    </main>
  );
}
