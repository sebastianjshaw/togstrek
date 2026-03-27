import Image from "next/image";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";
import type { TogstrekImageAsset } from "@/types/togstrek-place-page";

type TogstrekHikingHubHeroProps = {
  heroImage: TogstrekImageAsset;
  /** Accessible page title — visually hidden; hero foreground is the quote. */
  pageTitle: string;
};

/**
 * Squarespace-style hiking hub band: full-bleed photo, light overlay, quote + attribution.
 */
export function TogstrekHikingHubHero({
  heroImage,
  pageTitle,
}: TogstrekHikingHubHeroProps) {
  const iw =
    typeof heroImage.width === "number" && heroImage.width > 0
      ? heroImage.width
      : 1920;
  const ih =
    typeof heroImage.height === "number" && heroImage.height > 0
      ? heroImage.height
      : 1280;

  return (
    <section
      className="togstrek-hiking-hub-hero relative w-full overflow-hidden border-b border-tt-border-muted bg-tt-surface-inverse"
      aria-labelledby="togstrek-hiking-hub-sr-title"
    >
      <h1 id="togstrek-hiking-hub-sr-title" className="sr-only">
        {pageTitle}
      </h1>

      <div
        className="togstrek-hiking-hub-hero-media relative w-full min-h-[min(52vh,560px)] max-h-[min(72vh,720px)]"
        style={{ aspectRatio: `${iw} / ${ih}` }}
      >
        <Image
          src={heroImage.src}
          alt=""
          fill
          priority={heroImage.priority !== false}
          unoptimized={togstrekUnoptimizedRemoteImageInDev(heroImage.src)}
          className="object-cover object-center"
          sizes="100vw"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[color-mix(in_srgb,var(--tt-color-ink-strong)_15%,transparent)]"
          aria-hidden
        />
        <div className="absolute inset-0 z-[1] flex flex-col justify-center">
          <TogstrekContentWidth className="py-[max(var(--tt-space-12),env(safe-area-inset-top))] pb-[max(var(--tt-space-14),env(safe-area-inset-bottom))]">
            <h2 className="togstrek-hiking-hub-hero-quote max-w-[min(40rem,100%)] font-tt-display text-[clamp(1.35rem,2.6vw+0.6rem,2.35rem)] font-semibold leading-[var(--tt-leading-snug)] text-tt-text-inverse [text-shadow:0_2px_28px_rgba(0,0,0,0.45)]">
              Returning home is the most difficult part of long-distance{" "}
              <span className="text-tt-accent">hiking</span>; You have grown
              outside the puzzle and your piece no longer fits.
            </h2>
            <p className="togstrek-hiking-hub-hero-attribution mt-[var(--tt-space-5)] font-tt-body text-[length:var(--tt-text-body)] italic text-tt-text-inverse/90 [text-shadow:0_1px_18px_rgba(0,0,0,0.4)]">
              — Cindy Ross
            </p>
          </TogstrekContentWidth>
        </div>
      </div>
    </section>
  );
}
