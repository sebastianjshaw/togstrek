import Image from "next/image";
import Link from "next/link";

import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";
import {
  formatTogstrekHikingHubDate,
  type TogstrekHikingHubEntry,
} from "@/lib/togstrek-hiking-hub-entries";

type TogstrekHikingHubPostListProps = {
  entries: TogstrekHikingHubEntry[];
};

export function TogstrekHikingHubPostList({
  entries,
}: TogstrekHikingHubPostListProps) {
  if (entries.length === 0) return null;

  return (
    <div className="togstrek-hiking-hub-post-list mt-[var(--tt-space-14)] flex flex-col gap-0 border-t border-tt-border-muted">
      {entries.map((entry, index) => {
        const dateLabel = formatTogstrekHikingHubDate(entry.published);
        const imageLeft = index % 2 === 0;

        return (
          <article
            key={entry.href}
            className="togstrek-hiking-hub-post-list-item border-b border-tt-border-muted last:border-b-0"
          >
            <div
              className={`togstrek-hiking-hub-post-list-row flex flex-col gap-0 md:min-h-[min(52vw,420px)] md:flex-row ${imageLeft ? "" : "md:flex-row-reverse"}`}
            >
              <Link
                href={entry.href}
                className="togstrek-hiking-hub-post-list-media group relative block aspect-[3/2] w-full overflow-hidden bg-tt-surface-muted md:aspect-auto md:w-1/2 md:min-h-[min(52vw,420px)]"
              >
                {entry.heroImage ? (
                  <Image
                    src={entry.heroImage.src}
                    alt={entry.heroImage.alt}
                    fill
                    unoptimized={togstrekUnoptimizedRemoteImageInDev(
                      entry.heroImage.src,
                    )}
                    className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 767px) 100vw, 50vw"
                  />
                ) : (
                  <>
                    <div
                      className="togstrek-hiking-hub-post-list-placeholder absolute inset-0 bg-gradient-to-br from-tt-surface-muted via-tt-surface-base to-tt-surface-muted"
                      aria-hidden
                    />
                    <span className="sr-only">{entry.title}</span>
                  </>
                )}
              </Link>

              <div className="togstrek-hiking-hub-post-list-summary flex w-full flex-col justify-center bg-tt-surface-base px-[var(--tt-layout-gutter)] py-[var(--tt-space-12)] md:w-1/2 md:py-[var(--tt-space-16)]">
                <div className="togstrek-hiking-hub-post-list-meta font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary">
                  {entry.categoryLabel ? (
                    <span className="text-tt-text-secondary">
                      {entry.categoryLabel}
                    </span>
                  ) : null}
                  {entry.categoryLabel && dateLabel ? (
                    <span className="mx-2 text-tt-border-default" aria-hidden>
                      ·
                    </span>
                  ) : null}
                  {dateLabel ? <time dateTime={entry.published}>{dateLabel}</time> : null}
                </div>
                <h2 className="togstrek-hiking-hub-post-list-title mt-[var(--tt-space-3)] font-tt-display text-[length:var(--tt-text-title)] font-bold leading-[var(--tt-leading-tight)] text-tt-text-primary">
                  <Link
                    href={entry.href}
                    className="hover:text-tt-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-tt-accent"
                  >
                    {entry.title}
                  </Link>
                </h2>
                <p className="togstrek-hiking-hub-post-list-excerpt mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
                  {entry.description}
                </p>
                <Link
                  href={entry.href}
                  className="togstrek-hiking-hub-post-list-more mt-[var(--tt-space-6)] inline-flex w-fit font-tt-body text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-primary underline decoration-tt-border-default underline-offset-[0.35em] transition-colors hover:text-tt-accent hover:decoration-tt-accent"
                >
                  Read more
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
