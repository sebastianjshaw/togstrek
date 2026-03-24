import Image from "next/image";
import type { ReactNode } from "react";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekImageScrim } from "@/components/togstrek-ui/togstrek-image-scrim";

export type TogstrekPageHeroQuote = {
  children: ReactNode;
  attribution: string;
};

export type TogstrekPageHeroVariant = "landing" | "article";

export type TogstrekPageHeroProps = {
  variant?: TogstrekPageHeroVariant;
  imageSrc: string;
  imageAlt: string;
  /** `next/image` priority — landing defaults to true; article defaults to false unless set. */
  imagePriority?: boolean;
  eyebrow: string;
  title: string;
  titleId: string;
  quote?: TogstrekPageHeroQuote;
  showAccentRule?: boolean;
  lead?: ReactNode;
  actions?: ReactNode;
  stripTexture?: boolean;
};

/** Shared eyebrow label used in both hero variants. */
function HeroEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-tt-display text-tt-overline font-semibold uppercase tracking-tt-overline text-tt-text-inverse/90">
      {children}
    </p>
  );
}

/**
 * `landing` — full-viewport marketing hero (home, continent hubs).
 * `article` — shorter cinematic band for place MDX pages (aligned height/overlay).
 */
export function TogstrekPageHero({
  variant = "landing",
  imageSrc,
  imageAlt,
  imagePriority,
  eyebrow,
  title,
  titleId,
  quote,
  showAccentRule,
  lead,
  actions,
  stripTexture,
}: TogstrekPageHeroProps) {
  const landingPriority = imagePriority !== false;
  const articlePriority = imagePriority === true;

  if (variant === "article") {
    return (
      <section
        className="togstrek-page-hero togstrek-page-hero--article relative w-full overflow-hidden border-b border-tt-border-muted"
        aria-labelledby={titleId}
      >
        <div className="relative aspect-[21/9] min-h-[min(48vh,22rem)] w-full sm:min-h-[min(40vh,26rem)]">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={articlePriority}
            className="object-cover object-center"
            sizes="100vw"
          />
          <TogstrekImageScrim variant="soft" />
          <div className="absolute inset-x-0 bottom-0 z-[1] [text-shadow:0_2px_20px_rgba(0,0,0,0.55)]">
            <TogstrekContentWidth className="pb-[max(var(--tt-space-10),env(safe-area-inset-bottom))] pt-tt-16">
              <HeroEyebrow>{eyebrow}</HeroEyebrow>
              <h1
                id={titleId}
                className="mt-tt-2 max-w-[20ch] font-tt-display text-tt-subhero font-extrabold leading-tt-tight text-tt-text-inverse"
              >
                {title}
              </h1>
            </TogstrekContentWidth>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="togstrek-page-hero togstrek-page-hero--landing relative flex min-h-[min(88dvh,920px)] flex-col justify-end overflow-hidden border-b border-tt-border-muted sm:min-h-[min(92dvh,920px)]"
      aria-labelledby={titleId}
    >
      <div className="togstrek-page-hero-media absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={landingPriority}
          className="object-cover object-center"
          sizes="100vw"
        />
        <TogstrekImageScrim />
        <div
          className="pointer-events-none absolute inset-0 bg-[var(--tt-color-overlay-radial-vignette)]"
          aria-hidden={true}
        />
        {stripTexture ? (
          <>
            <div
              className="absolute inset-0 bg-[var(--tt-color-overlay-hero)]"
              aria-hidden={true}
            />
            <div
              className="absolute inset-0 opacity-[0.35] mix-blend-overlay bg-[var(--tt-color-overlay-texture-stripe)]"
              aria-hidden={true}
            />
          </>
        ) : null}
      </div>

      <div className="togstrek-page-hero-content relative z-[1] mx-auto w-full min-w-0 max-w-[var(--tt-layout-max-wide)] px-tt-gutter pb-[max(var(--tt-space-16),env(safe-area-inset-bottom))] pt-[max(var(--tt-space-16),env(safe-area-inset-top))] [text-shadow:0_2px_20px_rgba(0,0,0,0.55)] sm:pt-tt-24 md:pb-tt-20">
        <HeroEyebrow>{eyebrow}</HeroEyebrow>
        <h1
          id={titleId}
          className="togstrek-page-hero-title mt-tt-4 max-w-[min(22ch,100%)] font-tt-display text-tt-hero font-extrabold leading-tt-tight tracking-tt-tight text-tt-text-inverse [overflow-wrap:anywhere]"
        >
          {title}
        </h1>

        {showAccentRule ? (
          <div className="togstrek-page-hero-rule my-tt-8 h-1 w-24 bg-tt-accent shadow-[0_0_24px_color-mix(in_srgb,var(--tt-color-accent)_55%,transparent)]" />
        ) : null}

        {quote ? (
          <figure className="togstrek-page-hero-quote mt-tt-8 max-w-[min(36rem,100%)]">
            <blockquote className="font-tt-display text-tt-quote font-semibold leading-tt-snug text-tt-text-inverse [overflow-wrap:anywhere]">
              {quote.children}
            </blockquote>
            <figcaption className="mt-tt-3 font-tt-body text-tt-small italic text-tt-text-inverse/88">
              — {quote.attribution}
            </figcaption>
          </figure>
        ) : null}

        {lead ? (
          <div className="togstrek-page-hero-lead max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-lead leading-tt-relaxed text-tt-text-inverse/92 [overflow-wrap:anywhere]">
            {lead}
          </div>
        ) : null}

        {actions ? (
          <div className="togstrek-page-hero-actions mt-tt-10 flex w-full max-w-lg flex-col gap-tt-4 sm:max-w-none sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
