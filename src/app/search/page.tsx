import type { Metadata } from "next";

import { TogstrekPagefindUi } from "@/components/togstrek-search/togstrek-pagefind-ui";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

const SEARCH_DESCRIPTION =
  "Search hiking guides, travel stories, photography, and place pages across Tog’s Trek.";

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Search",
  description: SEARCH_DESCRIPTION,
  path: "/search",
});

export default function SearchPage() {
  return (
    <main className="togstrek-search-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <TogstrekPageTitle id="togstrek-search-title">Search</TogstrekPageTitle>
        <p className="togstrek-search-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          {SEARCH_DESCRIPTION}
        </p>
        {process.env.NODE_ENV === "development" ? (
          <p className="togstrek-search-dev-hint mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary">
            Local dev: run{" "}
            <code className="rounded bg-tt-surface-muted px-1 py-0.5 font-mono text-[0.9em]">
              npm run build
            </code>{" "}
            (or{" "}
            <code className="rounded bg-tt-surface-muted px-1 py-0.5 font-mono text-[0.9em]">
              npm run pagefind:index
            </code>{" "}
            after a build) so{" "}
            <code className="rounded bg-tt-surface-muted px-1 py-0.5 font-mono text-[0.9em]">
              public/pagefind
            </code>{" "}
            exists, then reload.
          </p>
        ) : null}
        <div className="togstrek-search-pagefind-mount mt-[var(--tt-space-10)] max-w-[min(42rem,100%)]">
          <TogstrekPagefindUi />
        </div>
      </TogstrekContentWidth>
    </main>
  );
}
