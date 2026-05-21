import Image from "next/image";
import Link from "next/link";

import { TogstrekPageHeroFallbackHeader } from "@/components/togstrek-ui/togstrek-page-hero-fallback-header";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import {
  buildTogstrekPhotographyBreadcrumbItems,
  isTogstrekPhotographyCategorySlug,
  listTogstrekPhotographySlugListsInCategory,
} from "@/lib/togstrek-photography-nav";
import { loadTogstrekPhotographyFrontmatterOnly } from "@/lib/togstrek-load-photography-mdx";
import { togstrekMainLandmarkProps } from "@/lib/togstrek-main-landmark";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";

type TogstrekPhotographyCategoryPageProps = {
  category: string;
};

function formatCategoryTitle(category: string): string {
  return category
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function TogstrekPhotographyCategoryPage({
  category,
}: TogstrekPhotographyCategoryPageProps) {
  if (!isTogstrekPhotographyCategorySlug(category)) {
    return null;
  }

  const title = formatCategoryTitle(category);
  const posts = listTogstrekPhotographySlugListsInCategory(category).map(
    (segments) => {
      const fm = loadTogstrekPhotographyFrontmatterOnly(segments);
      return {
        href: `/photography/${segments.join("/")}`,
        title: fm.title,
        imageSrc: fm.heroImage?.src,
        imageAlt: fm.heroImage?.alt ?? fm.title,
      };
    },
  );

  return (
    <main
      {...togstrekMainLandmarkProps}
      className="togstrek-photography-category-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]"
    >
      <TogstrekPageHeroFallbackHeader
        title={title}
        titleId="togstrek-photography-category-title"
      />

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb
          items={buildTogstrekPhotographyBreadcrumbItems([category], title)}
        />

        <nav
          className="togstrek-photography-category-grid mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label={`${title} photo essays`}
        >
          {posts.map((post) => (
            <Link
              key={post.href}
              href={post.href}
              className="togstrek-photography-category-card group block overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-base outline-none transition hover:border-tt-border-accent focus-visible:ring-2 focus-visible:ring-tt-accent"
            >
              {post.imageSrc ? (
                <div className="relative aspect-[3/2] w-full overflow-hidden bg-tt-surface-muted">
                  <Image
                    src={post.imageSrc}
                    alt={post.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.02]"
                    unoptimized={togstrekUnoptimizedRemoteImageInDev(post.imageSrc)}
                  />
                </div>
              ) : null}
              <p className="px-4 py-3 font-tt-display text-[length:var(--tt-text-body)] font-semibold text-tt-text-primary group-hover:text-tt-accent">
                {post.title}
              </p>
            </Link>
          ))}
        </nav>
      </TogstrekContentWidth>
    </main>
  );
}
