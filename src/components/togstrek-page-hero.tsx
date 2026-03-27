import Image from "next/image";
import type { ReactNode } from "react";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";

export type TogstrekPageHeroQuote = {
  children: ReactNode;
  attribution: string;
};

export type TogstrekPageHeroVariant = "landing" | "article";

export type TogstrekPageHeroProps = {
  variant?: TogstrekPageHeroVariant;
  imageSrc: string;
  imageAlt: string;
  /** Natural pixel size (e.g. from MDX frontmatter) — preserves aspect on place/article heroes. */
  imageWidth?: number;
  imageHeight?: number;
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

/**
 * `landing` — full-viewport marketing hero (home, continent hubs).
 * `article` — shorter cinematic band for place MDX pages (aligned height/overlay).
 */
export function TogstrekPageHero({
  variant = "landing",
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
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
    const iw =
      typeof imageWidth === "number" && imageWidth > 0 ? imageWidth : 2400;
    const ih =
      typeof imageHeight === "number" && imageHeight > 0 ? imageHeight : 1000;

    return (
      <section
        className="togstrek-page-hero togstrek-page-hero--article relative w-full overflow-hidden border-b border-tt-border-muted bg-tt-surface-base"
        aria-labelledby={titleId}
      >
        <div
          className="togstrek-page-hero-article-media relative w-full max-h-[min(72vh,680px)]"
          style={{ aspectRatio: `${iw} / ${ih}` }}
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority={articlePriority}
            unoptimized={togstrekUnoptimizedRemoteImageInDev(imageSrc)}
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_78%,transparent)] via-transparent to-transparent"
            aria-hidden
          />
          <div className="absolute inset-x-0 bottom-0 z-[1] [text-shadow:0_2px_20px_rgba(0,0,0,0.55)]">
            <TogstrekContentWidth className="pb-[max(var(--tt-space-10),env(safe-area-inset-bottom))] pt-[var(--tt-space-16)]">
              <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-inverse/90">
                {eyebrow}
              </p>
              <h1
                id={titleId}
                className="mt-[var(--tt-space-2)] max-w-[20ch] font-tt-display text-[clamp(1.75rem,4vw,3rem)] font-extrabold leading-[var(--tt-leading-tight)] text-tt-text-inverse"
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
          unoptimized={togstrekUnoptimizedRemoteImageInDev(imageSrc)}
          className="object-cover object-center"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_88%,transparent)] via-[color-mix(in_srgb,var(--tt-color-ink-strong)_35%,transparent)] to-[color-mix(in_srgb,var(--tt-color-ink-strong)_18%,transparent)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,rgba(0,0,0,0.42)_0%,transparent_68%)]"
          aria-hidden
        />
        {stripTexture ? (
          <>
            <div
              className="absolute inset-0 bg-[var(--tt-color-overlay-hero)]"
              aria-hidden
            />
            <div
              className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(-12deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 3px)",
              }}
              aria-hidden
            />
          </>
        ) : null}
      </div>

      <div className="togstrek-page-hero-content relative z-[1] mx-auto w-full min-w-0 max-w-[var(--tt-layout-max-wide)] px-[var(--tt-layout-gutter)] pb-[max(var(--tt-space-16),env(safe-area-inset-bottom))] pt-[max(var(--tt-space-16),env(safe-area-inset-top))] [text-shadow:0_2px_20px_rgba(0,0,0,0.55)] sm:pt-[var(--tt-space-24)] md:pb-[var(--tt-space-20)]">
        <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-inverse/90">
          {eyebrow}
        </p>
        <h1
          id={titleId}
          className="togstrek-page-hero-title mt-[var(--tt-space-4)] max-w-[min(22ch,100%)] font-tt-display text-[length:var(--tt-text-hero)] font-extrabold leading-[var(--tt-leading-tight)] tracking-[var(--tt-tracking-tight)] text-tt-text-inverse [overflow-wrap:anywhere]"
        >
          {title}
        </h1>

        {showAccentRule ? (
          <div className="togstrek-page-hero-rule my-[var(--tt-space-8)] h-1 w-24 bg-tt-accent shadow-[0_0_24px_color-mix(in_srgb,var(--tt-color-accent)_55%,transparent)]" />
        ) : null}

        {quote ? (
          <figure className="togstrek-page-hero-quote mt-[var(--tt-space-8)] max-w-[min(36rem,100%)]">
            <blockquote className="font-tt-display text-[clamp(1.05rem,2vw+0.55rem,1.65rem)] font-semibold leading-[var(--tt-leading-snug)] text-tt-text-inverse [overflow-wrap:anywhere]">
              {quote.children}
            </blockquote>
            <figcaption className="mt-[var(--tt-space-3)] font-tt-body text-[length:var(--tt-text-small)] italic text-tt-text-inverse/88">
              — {quote.attribution}
            </figcaption>
          </figure>
        ) : null}

        {lead ? (
          <div className="togstrek-page-hero-lead max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-inverse/92 [overflow-wrap:anywhere]">
            {lead}
          </div>
        ) : null}

        {actions ? (
          <div className="togstrek-page-hero-actions mt-[var(--tt-space-10)] flex w-full max-w-lg flex-col gap-4 sm:max-w-none sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
