import type { ReactNode } from "react";

import { TogstrekHikingHubGroupList } from "@/components/togstrek-hiking/togstrek-hiking-hub-group-list";
import { TogstrekHikingHubHero } from "@/components/togstrek-hiking/togstrek-hiking-hub-hero";
import { TogstrekHikingHubPostList } from "@/components/togstrek-hiking/togstrek-hiking-hub-post-list";
import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TogstrekHikingMapSection } from "@/components/togstrek-hiking/togstrek-hiking-map-section";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import {
  getTogstrekHikingHubGroupEntries,
  getTogstrekHikingPostsInGroup,
} from "@/lib/togstrek-hiking-hub-entries";
import type { TogstrekHikingMdxFrontmatter } from "@/lib/togstrek-hiking-frontmatter";
import {
  buildTogstrekHikingMapPlaces,
  buildTogstrekHikingMapPlacesForGroup,
} from "@/lib/togstrek-hiking-map-data";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";

export type TogstrekHikingPageVariant = "hub" | "group" | "post";

type TogstrekHikingPageTemplateProps = {
  variant: TogstrekHikingPageVariant;
  frontmatter: TogstrekHikingMdxFrontmatter;
  mdxContent: ReactNode;
  /** URL segments under `/hiking` (empty on `/hiking` index). */
  slugSegments: string[];
};

function segmentLabel(segment: string): string {
  return segment.replace(/-/g, " ");
}

export function TogstrekHikingPageTemplate({
  variant,
  frontmatter,
  mdxContent,
  slugSegments,
}: TogstrekHikingPageTemplateProps) {
  const isHub = variant === "hub";
  const isGroup = variant === "group";
  const isPost = variant === "post";

  const hubGroupEntries = isHub ? getTogstrekHikingHubGroupEntries() : [];
  const groupPostEntries =
    isGroup && slugSegments.length > 0
      ? getTogstrekHikingPostsInGroup(slugSegments)
      : [];

  const hubMapPlaces = isHub ? buildTogstrekHikingMapPlaces() : [];
  const groupMapPlaces =
    isGroup && slugSegments.length > 0
      ? buildTogstrekHikingMapPlacesForGroup(slugSegments)
      : [];

  const breadcrumbItems =
    slugSegments.length === 0
      ? [{ label: frontmatter.title }]
      : (() => {
          const items: { href?: string; label: string }[] = [
            { href: "/hiking", label: "Hiking" },
          ];
          for (let i = 0; i < slugSegments.length - 1; i++) {
            const seg = slugSegments[i]!;
            items.push({
              href: `/hiking/${slugSegments.slice(0, i + 1).join("/")}`,
              label: segmentLabel(seg),
            });
          }
          items.push({ label: frontmatter.title });
          return items;
        })();

  const eyebrow =
    slugSegments.length > 0
      ? segmentLabel(slugSegments[slugSegments.length - 1]!)
      : "Trails";

  return (
    <main className="togstrek-hiking-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {isHub && frontmatter.heroImage ? (
        <TogstrekHikingHubHero
          heroImage={frontmatter.heroImage}
          pageTitle={frontmatter.title}
        />
      ) : null}

      {isHub && !frontmatter.heroImage ? (
        <header className="togstrek-hiking-header border-b border-tt-border-muted bg-tt-surface-muted">
          <TogstrekContentWidth className="py-[var(--tt-space-12)]">
            <TogstrekPageTitle id="togstrek-hiking-title">
              {frontmatter.title}
            </TogstrekPageTitle>
          </TogstrekContentWidth>
        </header>
      ) : null}

      {(isGroup || isPost) && frontmatter.heroImage ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={frontmatter.heroImage.src}
          imageAlt={frontmatter.heroImage.alt}
          imageWidth={frontmatter.heroImage.width}
          imageHeight={frontmatter.heroImage.height}
          imagePriority={frontmatter.heroImage.priority}
          eyebrow={eyebrow}
          title={frontmatter.title}
          titleId="togstrek-hiking-hero-title"
        />
      ) : null}

      {(isGroup || isPost) && !frontmatter.heroImage ? (
        <header className="togstrek-hiking-header border-b border-tt-border-muted bg-tt-surface-muted">
          <TogstrekContentWidth className="py-[var(--tt-space-12)]">
            <TogstrekPageTitle id="togstrek-hiking-title">
              {frontmatter.title}
            </TogstrekPageTitle>
          </TogstrekContentWidth>
        </header>
      ) : null}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={breadcrumbItems} />

        <p className="togstrek-hiking-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          {frontmatter.description}
        </p>

        {isPost && frontmatter.published ? (
          <p className="mt-[var(--tt-space-4)] font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary">
            Published {frontmatter.published}
            {frontmatter.modified
              ? ` · Updated ${frontmatter.modified}`
              : ""}
          </p>
        ) : null}

        {mdxContent ? (
          <TogstrekMdxLightboxScope>
            <article
              className={`togstrek-prose togstrek-hiking-mdx-root ${isHub ? "mt-[var(--tt-space-12)]" : "mt-[var(--tt-space-12)]"}`}
            >
              {mdxContent}
            </article>
          </TogstrekMdxLightboxScope>
        ) : null}

        {isHub && hubMapPlaces.length > 0 ? (
          <TogstrekHikingMapSection places={hubMapPlaces} variant="hub" />
        ) : null}

        {isGroup && groupMapPlaces.length > 0 ? (
          <TogstrekHikingMapSection places={groupMapPlaces} variant="group" />
        ) : null}

        {isHub ? (
          <TogstrekHikingHubGroupList entries={hubGroupEntries} />
        ) : null}

        {isGroup ? (
          <TogstrekHikingHubPostList entries={groupPostEntries} />
        ) : null}
      </TogstrekContentWidth>
    </main>
  );
}
