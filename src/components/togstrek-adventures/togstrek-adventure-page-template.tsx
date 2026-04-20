import type { ReactNode } from "react";

import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekAdventureBlurbCta } from "@/components/togstrek-adventures/togstrek-adventure-blurb-cta";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageHeroFallbackHeader } from "@/components/togstrek-ui/togstrek-page-hero-fallback-header";
import { TogstrekDescriptionLead } from "@/components/togstrek-ui/togstrek-description-lead";
import { TogstrekPublishedDate } from "@/components/togstrek-ui/togstrek-published-date";
import { TogstrekMdxLightboxScope } from "@/components/togstrek-ui/togstrek-mdx-lightbox-scope";
import type { TogstrekAdventureMdxFrontmatter } from "@/lib/togstrek-adventure-frontmatter";
import { togstrekAdventureStoryJsonLdGraph } from "@/lib/togstrek-json-ld";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";

type TogstrekAdventurePageTemplateProps = {
  slug: string;
  frontmatter: TogstrekAdventureMdxFrontmatter;
  mdxContent: ReactNode;
  omitDescriptionLead?: boolean;
};

export function TogstrekAdventurePageTemplate({
  slug,
  frontmatter,
  mdxContent,
  omitDescriptionLead = false,
}: TogstrekAdventurePageTemplateProps) {
  const path = `/adventures/${slug}`;
  const showDescriptionLead =
    Boolean(frontmatter.description) && !omitDescriptionLead;
  const hero = frontmatter.heroImage;

  const breadcrumbLd = [
    { name: "Adventures", path: "/adventures" },
    { name: frontmatter.title, path },
  ];

  return (
    <main className="togstrek-adventure-story-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekJsonLd
        data={togstrekAdventureStoryJsonLdGraph({
          headline: frontmatter.title,
          description: frontmatter.description,
          urlPath: path,
          datePublished: frontmatter.published,
          dateModified: frontmatter.modified,
          imageUrl: hero?.src,
          breadcrumb: breadcrumbLd,
        })}
      />

      {hero ? (
        <TogstrekPageHero
          variant="article"
          imageSrc={hero.src}
          imageAlt={hero.alt}
          imageWidth={hero.width}
          imageHeight={hero.height}
          imagePriority={hero.priority}
          eyebrow="Adventure"
          title={frontmatter.title}
          titleId="togstrek-adventure-story-hero-title"
        />
      ) : (
        <TogstrekPageHeroFallbackHeader
          eyebrow="Adventure"
          title={frontmatter.title}
          titleId="togstrek-adventure-story-hero-title"
        />
      )}

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb
          items={[
            { href: "/adventures", label: "Adventures" },
            { label: frontmatter.title },
          ]}
        />

        {showDescriptionLead ? (
          <TogstrekDescriptionLead>{frontmatter.description}</TogstrekDescriptionLead>
        ) : null}

        <TogstrekPublishedDate
          published={frontmatter.published}
          modified={frontmatter.modified}
          descriptionLeadShown={showDescriptionLead}
        />

        <TogstrekMdxLightboxScope>
          <article className="togstrek-prose togstrek-adventure-mdx-root mx-auto mt-[var(--tt-space-12)] w-full max-w-[min(var(--tt-layout-max-wide),100%)] [&_.togstrek-adventure-featured-section]:max-w-none">
            {mdxContent}
          </article>
        </TogstrekMdxLightboxScope>

        <div className="togstrek-adventure-story-blurb-wrap mt-[var(--tt-space-16)] border-t border-tt-border-muted pt-[var(--tt-space-12)]">
          <TogstrekAdventureBlurbCta />
        </div>
      </TogstrekContentWidth>
    </main>
  );
}
