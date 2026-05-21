import { TogstrekCdnImage } from "@/components/togstrek-ui/togstrek-cdn-image";
import Link from "next/link";

import type { TogstrekOtherWorkHubFeatured } from "@/data/togstrek-other-work-hub";

type TogstrekOtherWorkFeaturedGridProps = {
  items: TogstrekOtherWorkHubFeatured[];
  ariaLabel: string;
  className?: string;
};

/**
 * Compact 4∶3 tiles + title + date — same layout as the main `/other-work` hub “Featured” row.
 */
export function TogstrekOtherWorkFeaturedGrid({
  items,
  ariaLabel,
  className,
}: TogstrekOtherWorkFeaturedGridProps) {
  return (
    <nav
      className={`togstrek-other-work-hub-featured-grid grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 xl:grid-cols-5 ${className ?? ""}`}
      aria-label={ariaLabel}
    >
      {items.map((item) => (
        <Link
          key={`${item.href}-${item.date}`}
          href={item.href}
          className="togstrek-other-work-hub-featured-card group flex flex-col overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-base outline-none transition hover:border-tt-border-accent focus-visible:ring-2 focus-visible:ring-tt-accent"
        >
          <div className="togstrek-other-work-hub-featured-card-media relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-tt-surface-muted">
            <TogstrekCdnImage
              src={item.imageSrc}
              alt={item.imageAlt}
              fill
              slot="photographyHub"
              loading="lazy"
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="togstrek-other-work-hub-featured-card-meta flex min-h-0 flex-1 flex-col gap-1 p-2 sm:p-2.5">
            <span className="line-clamp-2 font-tt-body text-[length:var(--tt-text-small)] font-medium leading-snug text-tt-text-primary sm:text-[13px]">
              {item.title}
            </span>
            <time
              className="font-tt-body text-[11px] text-tt-text-tertiary"
              dateTime={item.date}
            >
              {item.date}
            </time>
          </div>
        </Link>
      ))}
    </nav>
  );
}
