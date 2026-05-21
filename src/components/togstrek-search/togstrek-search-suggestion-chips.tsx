"use client";

import { TOGSTREK_SEARCH_SUGGESTION_TERMS } from "@/data/togstrek-search-suggestion-terms";
import { dispatchTogstrekSearchSuggest } from "@/lib/togstrek-search-suggest";

const TOGSTREK_SEARCH_SUGGESTION_CHIP_CLASSNAME =
  "togstrek-search-suggestion-chip inline-flex min-h-11 items-center rounded-full border border-tt-border-muted bg-tt-surface-base px-3 py-1 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary transition-[border-color,transform,box-shadow] duration-[var(--tt-duration-fast)] ease-[var(--tt-ease-out)] hover:border-tt-accent/40 motion-safe:hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-muted/60";

type TogstrekSearchSuggestionChipsProps = {
  className?: string;
};

export function TogstrekSearchSuggestionChips({
  className = "",
}: TogstrekSearchSuggestionChipsProps) {
  return (
    <ul
      className={`mt-[var(--tt-space-4)] flex flex-wrap gap-2 ${className}`.trim()}
    >
      {TOGSTREK_SEARCH_SUGGESTION_TERMS.map((term) => (
        <li key={term}>
          <button
            type="button"
            onClick={() => dispatchTogstrekSearchSuggest(term)}
            className={TOGSTREK_SEARCH_SUGGESTION_CHIP_CLASSNAME}
          >
            {term}
          </button>
        </li>
      ))}
    </ul>
  );
}
