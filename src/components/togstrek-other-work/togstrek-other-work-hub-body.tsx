import Image from "next/image";
import Link from "next/link";

import { TogstrekOtherWorkFeaturedGrid } from "@/components/togstrek-other-work/togstrek-other-work-featured-grid";
import {
  togstrekOtherWorkHubFeatured,
  togstrekOtherWorkHubSections,
} from "@/data/togstrek-other-work-hub";
import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";

export function TogstrekOtherWorkHubBody() {
  return (
    <div className="togstrek-other-work-hub-body not-prose w-full max-w-none">
      <h2 className="togstrek-other-work-hub-heading font-tt-display text-[length:var(--tt-text-title)] font-bold tracking-tight text-tt-text-primary">
        Photography
      </h2>
      <p className="togstrek-other-work-hub-lead mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
        Exploration is not just travelling. It’s how you look at the world, how
        you try new things, and how you learn.
      </p>

      <nav
        className="togstrek-other-work-hub-section-grid mt-[var(--tt-space-10)] grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        aria-label="Portfolio collections"
      >
        {togstrekOtherWorkHubSections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="togstrek-other-work-hub-section-card group block rounded-[var(--tt-radius-sm)] border border-tt-border-muted bg-tt-surface-base p-1.5 outline-none transition hover:border-tt-border-accent focus-visible:ring-2 focus-visible:ring-tt-accent sm:p-2"
          >
            <div className="togstrek-other-work-hub-section-card-media relative aspect-[4/3] w-full overflow-hidden rounded-[calc(var(--tt-radius-sm)-2px)] bg-tt-surface-muted">
              <Image
                src={item.imageSrc}
                alt={item.imageAlt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                loading="lazy"
                className="object-cover transition duration-300 group-hover:scale-[1.02]"
                unoptimized={togstrekUnoptimizedRemoteImageInDev(item.imageSrc)}
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
