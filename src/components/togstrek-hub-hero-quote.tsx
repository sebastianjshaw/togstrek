import type { ReactNode } from "react";

type TogstrekHubHeroQuoteProps = {
  /** Quote body (use accent spans for highlighted place names). */
  children: ReactNode;
  /** Attribution line after the em dash (e.g. author name). */
  attribution: string;
};

/**
 * Centred pull quote for region / country hub hero images. Reuse on each
 * continent and country page with the same layout.
 */
export function TogstrekHubHeroQuote({
  children,
  attribution,
}: TogstrekHubHeroQuoteProps) {
  return (
    <figure className="togstrek-hub-hero-quote pointer-events-none mx-auto w-full max-w-[min(36rem,calc(100vw-2rem))] text-center">
      <blockquote className="font-tt-display text-[clamp(1.05rem,2.2vw+0.55rem,1.75rem)] font-semibold leading-[var(--tt-leading-snug)] text-tt-text-inverse [text-shadow:0_2px_28px_rgba(0,0,0,0.65),0_1px_3px_rgba(0,0,0,0.45)] [overflow-wrap:anywhere]">
        {children}
      </blockquote>
      <figcaption className="mt-[var(--tt-space-4)] font-tt-body text-[length:var(--tt-text-small)] italic text-tt-text-inverse/90 [text-shadow:0_1px_16px_rgba(0,0,0,0.55)]">
        — {attribution}
      </figcaption>
    </figure>
  );
}
