/**
 * Country hub quotes: full quote + attribution on the country hub header
 * (`/{continent}/{country}`). Continent hub tiles use the saying only — see
 * `getTogstrekCountryHubTileQuote`.
 */

export type TogstrekCountryHubHeaderQuote = {
  body: string;
  attribution: string;
};

/**
 * Optional blockquote under the country hub title (`/{continent}/{country}`).
 * Keyed by ISO 3166-1 alpha-2.
 */
export const togstrekCountryHubHeaderQuoteByIso2: Partial<
  Record<string, TogstrekCountryHubHeaderQuote>
> = {
  AR: {
    body: "We are Argentina. Who the opponent is doesn't matter.",
    attribution: "Leo Messi",
  },
  CO: {
    body: "In Colombia, we have a lot of passion.",
    attribution: "Maluma",
  },
  EC: {
    body: "Anybody who's been to Ecuador wants to go back because it's beautiful out there.",
    attribution: "Michael Steger",
  },
};

/** Pull line for continent hub country tiles — saying only, no attribution. */
export function getTogstrekCountryHubTileQuote(iso2: string): string | undefined {
  return togstrekCountryHubHeaderQuoteByIso2[iso2]?.body;
}
