import type { Metadata } from "next";
import Link from "next/link";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";

export const metadata: Metadata = {
  title: "Not found",
  description: "That URL is not part of this site — try search or head home.",
};

export default function NotFound() {
  return (
    <main className="togstrek-not-found-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <p className="font-tt-body text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-tertiary">
          404
        </p>
        <h1
          id="togstrek-not-found-title"
          className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-display text-[length:var(--tt-text-title)] font-semibold leading-[var(--tt-leading-snug)] tracking-[var(--tt-tracking-tight)] text-tt-text-primary"
        >
          Off the map
        </h1>
        <p className="mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          This URL doesn&apos;t match any page here — not a country hub, not a
          trail write-up, not even a half-migrated blog stub. Worth checking the
          address for a typo, or the trail might have moved when the routes were
          last redrawn.
        </p>
        <ul className="mt-[var(--tt-space-8)] flex flex-wrap gap-4">
          <li>
            <Link
              href="/"
              className="rounded-sm font-tt-body text-[length:var(--tt-text-body)] font-medium text-tt-accent underline-offset-4 transition-colors hover:text-tt-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              href="/search"
              className="rounded-sm font-tt-body text-[length:var(--tt-text-body)] font-medium text-tt-accent underline-offset-4 transition-colors hover:text-tt-accent-hover hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base"
            >
              Search the site
            </Link>
          </li>
        </ul>
      </TogstrekContentWidth>
    </main>
  );
}
