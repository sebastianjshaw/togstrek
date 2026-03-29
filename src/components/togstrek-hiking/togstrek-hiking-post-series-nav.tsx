import Link from "next/link";

import type { TogstrekHikingPostSeriesNeighbor } from "@/lib/togstrek-hiking-hub-entries";

export type TogstrekHikingPostSeriesNavProps = {
  prev?: TogstrekHikingPostSeriesNeighbor;
  next?: TogstrekHikingPostSeriesNeighbor;
};

/**
 * Previous / next links for multipage hike posts (e.g. Kungsleden stages).
 */
export function TogstrekHikingPostSeriesNav({
  prev,
  next,
}: TogstrekHikingPostSeriesNavProps) {
  if (!prev && !next) return null;

  const linkClass =
    "togstrek-hiking-post-series-nav-link inline-flex max-w-[min(100%,20rem)] flex-col gap-1 rounded-sm border border-transparent px-3 py-2 font-tt-body text-[length:var(--tt-text-small)] text-tt-accent transition-colors hover:border-tt-border-muted hover:bg-tt-surface-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tt-accent";

  return (
    <nav
      className="togstrek-hiking-post-series-nav mt-[var(--tt-space-14)] border-t border-tt-border-muted pt-[var(--tt-space-10)]"
      aria-label="Trail stages in this hike"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
        <div className="min-w-0">
          {prev ? (
            <Link href={prev.href} className={`${linkClass} items-start`}>
              <span className="font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-tertiary">
                &lt; Previous
              </span>
              <span className="text-tt-text-primary [overflow-wrap:anywhere]">
                {prev.title}
              </span>
            </Link>
          ) : null}
        </div>
        <div className="min-w-0 sm:justify-self-end sm:text-right">
          {next ? (
            <Link
              href={next.href}
              className={`${linkClass} items-end sm:ml-auto sm:text-right`}
            >
              <span className="font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-tertiary">
                Next &gt;
              </span>
              <span className="text-tt-text-primary [overflow-wrap:anywhere]">
                {next.title}
              </span>
            </Link>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
