import type { TogstrekPageHeroQuote } from "@/components/togstrek-page-hero";

/**
 * Optional hero quote per continent hub. Replace placeholder copy when you have final lines.
 * Europe uses the existing Eddie Izzard line; others use short placeholders.
 */
export function continentHubHeroQuoteForSlug(
  continentSlug: string,
): TogstrekPageHeroQuote | undefined {
  switch (continentSlug) {
    case "europe":
      return {
        attribution: "Eddie Izzard",
        children: (
          <>
            I grew up in <span className="text-tt-accent">Europe</span>, where
            the history comes from.
          </>
        ),
      };
    case "africa":
      return {
        attribution: "Placeholder",
        children: (
          <>
            Hero quote for Africa —{" "}
            <span className="text-tt-accent">replace with final copy</span>.
          </>
        ),
      };
    case "asia":
      return {
        attribution: "Placeholder",
        children: (
          <>
            Hero quote for Asia —{" "}
            <span className="text-tt-accent">replace with final copy</span>.
          </>
        ),
      };
    case "north-america":
      return {
        attribution: "Placeholder",
        children: (
          <>
            Hero quote for North America —{" "}
            <span className="text-tt-accent">replace with final copy</span>.
          </>
        ),
      };
    case "south-america":
      return {
        attribution: "Placeholder",
        children: (
          <>
            Hero quote for South America —{" "}
            <span className="text-tt-accent">replace with final copy</span>.
          </>
        ),
      };
    case "oceania":
      return {
        attribution: "Placeholder",
        children: (
          <>
            Hero quote for Oceania —{" "}
            <span className="text-tt-accent">replace with final copy</span>.
          </>
        ),
      };
    case "antarctica":
      return {
        attribution: "Placeholder",
        children: (
          <>
            Hero quote for Antarctica —{" "}
            <span className="text-tt-accent">replace with final copy</span>.
          </>
        ),
      };
    default:
      return undefined;
  }
}
