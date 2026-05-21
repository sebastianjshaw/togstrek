/** Default example queries on `/search` (header chips + empty-state hints). */
export const TOGSTREK_SEARCH_SUGGESTION_TERMS = [
  "Kungsleden",
  "Istanbul",
  "Tulum",
  "Bohusleden",
  "street photography",
  "Svalbard",
] as const;

export type TogstrekSearchSuggestionTerm =
  (typeof TOGSTREK_SEARCH_SUGGESTION_TERMS)[number];
