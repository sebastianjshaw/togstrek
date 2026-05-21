import type { ReactNode } from "react";

import { TogstrekArticlePageTemplate } from "@/components/togstrek-article/togstrek-article-page-template";
import { TogstrekAdventureBlurbCta } from "@/components/togstrek-adventures/togstrek-adventure-blurb-cta";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import type { TogstrekAdventureMdxFrontmatter } from "@/lib/togstrek-adventure-frontmatter";
import { togstrekAdventureStoryJsonLdGraph } from "@/lib/togstrek-json-ld";

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
  const hero = frontmatter.heroImage;

  const breadcrumbLd = [
    { name: "Adventures", path: "/adventures" },
    { name: frontmatter.title, path },
  ];

  return (
    <TogstrekArticlePageTemplate
      pageClassName="togstrek-adventure-story-page"
      title={frontmatter.title}
      description={frontmatter.description}
      published={frontmatter.published}
      modified={frontmatter.modified}
      heroImage={hero}
      eyebrow="Adventure"
      heroTitleId="togstrek-adventure-story-hero-title"
      fallbackTitleId="togstrek-adventure-story-hero-title"
      breadcrumbItems={[
        { href: "/adventures", label: "Adventures" },
        { label: frontmatter.title },
      ]}
      mdxContent={mdxContent}
      omitDescriptionLead={omitDescriptionLead}
      articleClassName="togstrek-prose togstrek-adventure-mdx-root mx-auto mt-[var(--tt-space-12)] w-full max-w-[min(var(--tt-layout-max-wide),100%)] [&_.togstrek-adventure-featured-section]:max-w-none"
      headSlot={
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
      }
      afterArticle={
        <div className="togstrek-adventure-story-blurb-wrap mt-[var(--tt-space-16)] border-t border-tt-border-muted pt-[var(--tt-space-12)]">
          <TogstrekAdventureBlurbCta />
        </div>
      }
    />
  );
}
