import type { ReactNode } from "react";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import {
  buildTogstrekPlaceBreadcrumbJsonLdItems,
  buildTogstrekPlaceBreadcrumbUiItems,
} from "@/lib/togstrek-place-breadcrumb";
import { togstrekPlaceLeafSegment, togstrekPlacePathFromSegments } from "@/lib/togstrek-place-path";
import { togstrekPlacePageJsonLdGraph } from "@/lib/togstrek-json-ld";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import type { TogstrekPlaceMdxFrontmatter } from "@/lib/togstrek-place-frontmatter";

type TogstrekPlacePageTemplateProps = {
  frontmatter: TogstrekPlaceMdxFrontmatter;
  mdxContent: ReactNode;
  path: { continent: string; country: string; placeSegments: string[] };
  /** Hide YAML `description` lead when it duplicates the MDX body opening. */
  omitDescriptionLead?: boolean;
};

export function TogstrekPlacePageTemplate({
  frontmatter,
  mdxContent,
  path,
  omitDescriptionLead = false,
}: TogstrekPlacePageTemplateProps) {
  const { continent, country, placeSegments } = path;
  const placePathTail = togstrekPlacePathFromSegments(placeSegments);
  const placeLeaf = togstrekPlaceLeafSegment(placeSegments);
  const showDescriptionLead =
    Boolean(frontmatter.description) && !omitDescriptionLead;

  const placePath = `/${continent}/${country}/${placePathTail}`;

  const breadcrumbItems = buildTogstrekPlaceBreadcrumbUiItems(
    continent,
    country,
    placeSegments,
    frontmatter.title,
  );

  const placeBreadcrumbItems = buildTogstrekPlaceBreadcrumbJsonLdItems(
    continent,
    country,
    placeSegments,
    frontmatter.title,
    placePath,
  );

  return (
    <main
      className="togstrek-place-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]"
      {...(frontmatter.draft ? { "data-pagefind-ignore": true } : {})}
    >
      <TogstrekJsonLd
        data={togstrekPlacePageJsonLdGraph({
          name: frontmatter.title,
          description: frontmatter.description,
          urlPath: placePath,
          latitude: frontmatter.lat,
          longitude: frontmatter.lng,
          imageUrl: frontmatter.heroImage?.src,
          breadcrumb: placeBreadcrumbItems,
        })}
      />
      {frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow={formatSlugLabel(placeLeaf)}
          title={frontmatter.title}
          titleId="togstrek-place-hero-title"
        />
      ) : (
        <header className="togstrek-place-header border-b border-tt-border-muted bg-tt-surface-muted">
          <TogstrekContentWidth className="py-[var(--tt-space-12)]">
            <TogstrekPageTitle id="togstrek-place-title">
              {frontmatter.title}
            </TogstrekPageTitle>
          </TogstrekContentWidth>
        </header>
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        {showDescriptionLead ? (
          <p className="togstrek-place-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            {frontmatter.description}
          </p>
        ) : null}

        {frontmatter.published ? (
          <p
            className={`font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary ${
              showDescriptionLead
                ? "mt-[var(--tt-space-4)]"
                : "mt-[var(--tt-space-8)]"
            }`}
          >
            Published {frontmatter.published}
            {frontmatter.modified
              ? ` · Updated ${frontmatter.modified}`
              : ""}
          </p>
        ) : null}

        <TogstrekMdxLightboxScope>
          <article className="togstrek-prose togstrek-place-mdx-root mt-[var(--tt-space-12)]">
            {mdxContent}
          </article>
        </TogstrekMdxLightboxScope>
      </TogstrekContentWidth>
    </main>
  );
}
