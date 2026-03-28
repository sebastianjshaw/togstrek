import type { TogstrekPageHeroQuote } from "@/components/togstrek-page-hero";

/**
 * Optional hero quote on continent landing heroes. Only Europe ships with a
 * final line today; other continents omit the quote until real copy is ready
 * (see `docs/brand-tone-of-voice.md`).
 */
export function continentHubHeroQuoteForSlug(
  continentSlug: string,
): TogstrekPageHeroQuote | undefined {
  if (continentSlug === "europe") {
    return {
      attribution: "Eddie Izzard",
      children: (
        <>
          I grew up in <span className="text-tt-accent">Europe</span>, where the
          history comes from.
        </>
      ),
    };
  }
  return undefined;
}
