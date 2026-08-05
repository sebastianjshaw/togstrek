import type { Metadata } from "next";

import { TogstrekPagefindUi } from "@/components/togstrek-search/togstrek-pagefind-ui";
import { TogstrekSearchSuggestionChips } from "@/components/togstrek-search/togstrek-search-suggestion-chips";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";
import { togstrekMainLandmarkProps } from "@/lib/togstrek-main-landmark";
import { TOGSTREK_PAGE_CONTENT_Y } from "@/lib/togstrek-layout";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

const SEARCH_DESCRIPTION =
  "Search everything I’ve written here — hiking guides, travel stories, photography, and place pages.";

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Search",
  description: SEARCH_DESCRIPTION,
  path: "/search",
});

export default function SearchPage() {
  return (
    <main
      {...togstrekMainLandmarkProps}
      className="togstrek-search-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]"
      data-pagefind-ignore
    >
      <TogstrekContentWidth className={TOGSTREK_PAGE_CONTENT_Y}>
        <header className="togstrek-search-header">
          <TogstrekPageTitle id="togstrek-search-title">Search</TogstrekPageTitle>
          <p className="togstrek-search-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            {SEARCH_DESCRIPTION}
          </p>

          <div className="togstrek-search-suggestions mt-[var(--tt-space-8)] max-w-[min(48rem,100%)] rounded-[var(--tt-radius-lg)] border border-tt-border-muted bg-tt-surface-muted/60 px-[var(--tt-space-6)] py-[var(--tt-space-6)]">
            <p className="font-tt-body text-[length:var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-tertiary">
              Try searching for
            </p>
            <TogstrekSearchSuggestionChips />
            <p className="mt-[var(--tt-space-4)] max-w-[72ch] font-tt-body text-[length:var(--tt-text-small)] leading-[var(--tt-leading-relaxed)] text-tt-text-tertiary">
              Results open instantly and work entirely on this site — no accounts,
              no tracking pixels, no external search engine required.
            </p>
          </div>
        </header>

        <section
          className="togstrek-search-pagefind-section mt-[var(--tt-space-10)]"
          aria-labelledby="togstrek-search-ui-heading"
        >
          <h2
            id="togstrek-search-ui-heading"
            className="sr-only"
          >
            Search the site
          </h2>
          <div className="togstrek-search-pagefind-mount max-w-[min(46rem,100%)] rounded-[var(--tt-radius-xl)] border border-tt-border-muted bg-tt-surface-base px-[var(--tt-space-6)] py-[var(--tt-space-6)] shadow-[0_18px_60px_-40px_color-mix(in_srgb,var(--tt-color-ink-strong)_28%,transparent)]">
            <TogstrekPagefindUi />
          </div>
        </section>
      </TogstrekContentWidth>
    </main>
  );
}
