import Link from "next/link";

import { TogstrekOtherWorkFeaturedGrid } from "@/components/togstrek-other-work/togstrek-other-work-featured-grid";
import { TogstrekPageHeroFallbackHeader } from "@/components/togstrek-ui/togstrek-page-hero-fallback-header";
import { TogstrekBreadcrumb } from "@/components/togstrek-ui/togstrek-breadcrumb";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { togstrekOtherWorkHubFeatured } from "@/data/togstrek-other-work-hub";
import { discoverTogstrekPhotographyCategorySlugs } from "@/lib/togstrek-photography-nav";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";

function formatCategoryLabel(category: string): string {
  return category
    .split(/[-_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function TogstrekPhotographyHubPage() {
  const categories = discoverTogstrekPhotographyCategorySlugs();

  return (
    <main className="togstrek-photography-hub-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekPageHeroFallbackHeader
        title="Photography"
        titleId="togstrek-photography-hub-title"
      />

      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekBreadcrumb items={[{ label: "Photography" }]} />

        <p className="togstrek-photography-hub-lead mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          Longer photo essays and event coverage — grouped by collection. Studio
          portfolios and side projects live under{" "}
          <Link href="/other-work" className="text-tt-accent underline-offset-2 hover:underline">
            Other work
          </Link>
          .
        </p>

        <nav
          className="togstrek-photography-hub-category-nav mt-[var(--tt-space-10)] flex flex-wrap gap-2"
          aria-label="Photography collections"
        >
          {categories.map((category) => (
            <Link
              key={category}
              href={`/photography/${category}`}
              className="togstrek-photography-hub-category-pill rounded-full border border-tt-border-muted px-4 py-2 font-tt-display text-[length:var(--tt-text-small)] font-semibold uppercase tracking-wide text-tt-text-secondary outline-none transition hover:border-tt-border-accent hover:text-tt-accent focus-visible:ring-2 focus-visible:ring-tt-accent"
            >
              {formatCategoryLabel(category)}
            </Link>
          ))}
        </nav>

        <h2 className="togstrek-photography-hub-featured-heading mt-[var(--tt-space-14)] font-tt-display text-[length:var(--tt-text-lead)] font-semibold text-tt-text-primary">
          Featured
        </h2>
        <TogstrekOtherWorkFeaturedGrid
          items={togstrekOtherWorkHubFeatured}
          ariaLabel="Featured photography posts"
          className="mt-[var(--tt-space-6)]"
        />
      </TogstrekContentWidth>
    </main>
  );
}
