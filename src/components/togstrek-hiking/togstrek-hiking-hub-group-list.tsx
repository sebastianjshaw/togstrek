import { TogstrekCdnImage } from "@/components/togstrek-ui/togstrek-cdn-image";
import Link from "next/link";

import {
  formatTogstrekHikingHubDate,
  type TogstrekHikingHubEntry,
} from "@/lib/togstrek-hiking-hub-entries";

type TogstrekHikingHubGroupListProps = {
  entries: TogstrekHikingHubEntry[];
  /** Link affordance under the card (e.g. multi-day hub vs single report). */
  ctaLabel?: string;
  /** Trail stage cards: show `published` under the hero image. */
  showPublished?: boolean;
};

export function TogstrekHikingHubGroupList({
  entries,
  ctaLabel = "View hike →",
  showPublished = false,
}: TogstrekHikingHubGroupListProps) {
  if (entries.length === 0) return null;

  return (
    <ul className="togstrek-hiking-hub-group-list grid list-none grid-cols-1 gap-[var(--tt-space-8)] p-0 sm:grid-cols-2 lg:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.href} className="min-w-0">
          <Link
            href={entry.href}
            className="togstrek-hiking-hub-group-card group flex h-full flex-col overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-base shadow-[0_1px_0_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] hover:border-tt-border-default hover:shadow-[0_12px_40px_-24px_rgba(0,0,0,0.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tt-accent"
          >
            <div className="togstrek-hiking-hub-group-card-media relative aspect-[3/2] w-full overflow-hidden bg-tt-surface-muted">
              {entry.heroImage ? (
                <TogstrekCdnImage
                  src={entry.heroImage.src}
                  alt={entry.heroImage.alt}
                  fill
                  slot="hikingHubCard"
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-gradient-to-br from-tt-surface-muted via-tt-surface-base to-tt-surface-muted"
                  aria-hidden
                />
              )}
            </div>
            <div className="togstrek-hiking-hub-group-card-body flex flex-1 flex-col px-[var(--tt-space-5)] py-[var(--tt-space-6)]">
              {showPublished && entry.published ? (
                <time
                  dateTime={entry.published}
                  className="font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary"
                >
                  {formatTogstrekHikingHubDate(entry.published)}
                </time>
              ) : null}
              <span
                className={[
                  "font-tt-display text-[length:var(--tt-text-title)] font-bold leading-[var(--tt-leading-tight)] text-tt-text-primary group-hover:text-tt-accent",
                  showPublished && entry.published
                    ? "mt-[var(--tt-space-2)]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {entry.title}
              </span>
              <p className="togstrek-hiking-hub-group-card-desc mt-[var(--tt-space-3)] font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
                {entry.description}
              </p>
              <span className="togstrek-hiking-hub-group-card-cta mt-[var(--tt-space-5)] font-tt-body text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-tertiary group-hover:text-tt-accent">
                {ctaLabel}
              </span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
