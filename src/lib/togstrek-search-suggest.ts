/** Custom event: suggestion chip clicked → Pagefind input should run that query. */
export const TOGSTREK_SEARCH_SUGGEST_EVENT = "togstrek-search-suggest";

export type TogstrekSearchSuggestDetail = {
  term: string;
};

export function dispatchTogstrekSearchSuggest(term: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<TogstrekSearchSuggestDetail>(TOGSTREK_SEARCH_SUGGEST_EVENT, {
      detail: { term },
    }),
  );
}

export function subscribeTogstrekSearchSuggest(
  handler: (term: string) => void,
): () => void {
  const listener = (evt: Event) => {
    const term = (evt as CustomEvent<TogstrekSearchSuggestDetail>).detail?.term;
    if (typeof term === "string" && term.trim()) handler(term.trim());
  };
  window.addEventListener(TOGSTREK_SEARCH_SUGGEST_EVENT, listener);
  return () => window.removeEventListener(TOGSTREK_SEARCH_SUGGEST_EVENT, listener);
}
