import type { TogstrekPageHeroQuote } from "@/components/togstrek-page-hero";

/**
 * Pull quotes on continent landing heroes — one per hub route slug.
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
            I grew up in <span className="text-tt-accent">Europe</span>, where the
            history comes from.
          </>
        ),
      };
    case "oceania":
      return {
        attribution: "Peter Carey",
        children: (
          <>
            <span className="text-tt-accent">Australia</span> is my lens.
            I can&apos;t see the world any other way.
          </>
        ),
      };
    case "africa":
      return {
        attribution: "Pliny the Elder",
        children: (
          <>
            There is always something new out of{" "}
            <span className="text-tt-accent">Africa</span>.
          </>
        ),
      };
    case "antarctica":
      return {
        attribution: "Mark Hoppus",
        children: (
          <>
            <span className="text-tt-accent">Antarctica</span> is otherworldly,
            like nothing I&apos;ve ever seen before. Stark, cold, beautiful
            desolation.
          </>
        ),
      };
    case "asia":
      return {
        attribution: "Hanya Yanagihara",
        children: (
          <>
            Those of us lucky enough to fall in love with{" "}
            <span className="text-tt-accent">Asia</span> know that it&apos;s an
            affair that&apos;s as long as it is resonant.
          </>
        ),
      };
    case "north-america":
      return {
        attribution: "Tom G. Palmer",
        children: (
          <>
            Most Europeans have no idea how wild life can be in{" "}
            <span className="text-tt-accent">North America</span>.
          </>
        ),
      };
    case "south-america":
      return {
        attribution: "Ellie (Up)",
        children: (
          <>
            You know, <span className="text-tt-accent">South America</span>.
            It&apos;s like America, but south!
          </>
        ),
      };
    default:
      return undefined;
  }
}
