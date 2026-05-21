import { TogstrekCdnImage } from "@/components/togstrek-ui/togstrek-cdn-image";
import Link from "next/link";

import { TogstrekOtherWorkFeaturedGrid } from "@/components/togstrek-other-work/togstrek-other-work-featured-grid";
import {
  togstrekOtherWorkHubFeatured,
  togstrekOtherWorkHubSections,
} from "@/data/togstrek-other-work-hub";

export function TogstrekOtherWorkHubBody() {
  return (
    <div className="togstrek-other-work-hub-body not-prose w-full max-w-none">
      <h2 className="togstrek-other-work-hub-heading font-tt-display text-[length:var(--tt-text-title)] font-bold tracking-tight text-tt-text-primary">
        Other work
      </h2>
      <p className="togstrek-other-work-hub-lead mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
        Studios, events, street work, and longer photo essays grouped by
        collection — the portfolios that sit alongside the place guides and
        trail reports.
      </p>

      <nav
        className="togstrek-other-work-hub-section-grid mt-[var(--tt-space-10)] grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        aria-label="Portfolio collections"
      >
        {togstrekOtherWorkHubSections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="togstrek-other-work-hub-section-card group block overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-base p-1.5 outline-none transition hover:border-tt-border-accent focus-visible:ring-2 focus-visible:ring-tt-accent sm:p-2"
          >
            <div className="togstrek-other-work-hub-section-card-media relative aspect-[4/3] w-full overflow-hidden rounded-[var(--tt-radius-photo)] bg-tt-surface-muted">
              <TogstrekCdnImage
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                slot="otherWorkCard"
                loading="lazy"
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
              />
            </div>
            <p className="togstrek-other-work-hub-section-card-label mt-2 line-clamp-2 text-center font-tt-display text-[11px] font-semibold uppercase leading-tight tracking-wide text-tt-text-secondary transition group-hover:text-tt-accent sm:text-[length:var(--tt-text-small)]">
              {item.label}
            </p>
          </Link>
        ))}
      </nav>

      <h3 className="togstrek-other-work-hub-featured-title mt-[var(--tt-space-14)] font-tt-display text-[length:var(--tt-text-lead)] font-semibold text-tt-text-primary">
        Featured
      </h3>
      <TogstrekOtherWorkFeaturedGrid
        items={togstrekOtherWorkHubFeatured}
        ariaLabel="Featured posts"
        className="mt-[var(--tt-space-6)]"
      />
    </div>
  );
}
