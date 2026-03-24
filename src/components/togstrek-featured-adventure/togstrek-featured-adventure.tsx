import Image from "next/image";
import Link from "next/link";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekCtaOutlineAccentLink } from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";
import { TogstrekImageScrim } from "@/components/togstrek-ui/togstrek-image-scrim";
import { togstrekFeaturedAlpineAdventure } from "@/data/togstrek-featured-alpine-adventure";

type TogstrekFeaturedAdventureLayout = "media" | "panel";

type TogstrekFeaturedAdventureProps = {
  layout: TogstrekFeaturedAdventureLayout;
  /** Defaults to shared Alpine adventure content. */
  adventure?: typeof togstrekFeaturedAlpineAdventure;
  sectionAriaLabelledBy: string;
};

export function TogstrekFeaturedAdventure({
  layout,
  adventure = togstrekFeaturedAlpineAdventure,
  sectionAriaLabelledBy,
}: TogstrekFeaturedAdventureProps) {
  const kicker =
    layout === "media"
      ? adventure.kickerHome
      : adventure.kickerHub;

  if (layout === "media") {
    return (
      <section
        className="togstrek-featured-adventure togstrek-featured-adventure--media border-t border-tt-border-muted bg-tt-surface-muted py-tt-16 md:py-tt-20"
        aria-labelledby={sectionAriaLabelledBy}
      >
        <TogstrekContentWidth>
          <Link
            href={adventure.href}
            className="togstrek-featured-adventure-card group relative flex min-h-[min(52vw,20rem)] w-full flex-col justify-end overflow-hidden border border-tt-border-muted bg-tt-surface-base text-left shadow-[var(--tt-shadow-sm)] transition-[transform,box-shadow,border-color] duration-tt-normal ease-tt-out after:pointer-events-none after:absolute after:inset-0 after:z-tt-base after:border-tt-thick after:border-transparent after:transition-colors hover:-translate-y-1 hover:shadow-[var(--tt-shadow-elevated)] hover:after:border-tt-accent sm:min-h-[min(42vw,24rem)] md:aspect-[2.2/1] md:min-h-[min(36vh,26rem)]"
          >
            <Image
              src={adventure.imageSrc}
              alt={adventure.imageAlt}
              fill
              className="object-cover object-center transition-transform duration-tt-slow ease-tt-out group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, min(90rem, 100vw)"
            />
            <TogstrekImageScrim variant="deep" className="z-[1]" />
            <div className="relative z-[3] p-6 sm:p-8 md:p-10">
              <p className="font-tt-display text-tt-overline font-semibold uppercase tracking-tt-wide text-tt-accent">
                {kicker}
              </p>
              <h2
                id={sectionAriaLabelledBy}
                className="mt-tt-3 max-w-[min(28ch,100%)] font-tt-display text-tt-feature font-bold leading-tt-tight tracking-tt-tight text-tt-text-inverse [overflow-wrap:anywhere]"
              >
                {adventure.title}
              </h2>
              <p className="mt-tt-4 max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-lead font-semibold uppercase tracking-tt-wide text-tt-text-inverse/90 [overflow-wrap:anywhere]">
                {adventure.tagline}
              </p>
              <TogstrekCtaOutlineAccentLink asGroupChild className="togstrek-featured-adventure-cta mt-tt-8">
                {adventure.ctaLabel}
              </TogstrekCtaOutlineAccentLink>
            </div>
          </Link>
        </TogstrekContentWidth>
      </section>
    );
  }

  return (
    <section
      className="togstrek-featured-adventure togstrek-featured-adventure--panel border border-tt-border-muted bg-tt-surface-muted p-6 sm:p-8"
      aria-labelledby={sectionAriaLabelledBy}
    >
      <p className="font-tt-display text-tt-overline font-semibold uppercase tracking-tt-wide text-tt-accent">
        {kicker}
      </p>
      <h2
        id={sectionAriaLabelledBy}
        className="mt-tt-3 font-tt-display text-tt-title font-bold text-tt-text-primary"
      >
        {adventure.title}
      </h2>
      <p className="mt-tt-4 max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-lead font-semibold uppercase tracking-tt-wide text-tt-text-secondary">
        {adventure.tagline}
      </p>
      <p className="mt-tt-6 max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-lead leading-tt-relaxed text-tt-text-secondary">
        {adventure.body}
      </p>
      <TogstrekCtaOutlineAccentLink
        href={adventure.href}
        className="mt-tt-8"
      >
        {adventure.ctaLabel}
      </TogstrekCtaOutlineAccentLink>
    </section>
  );
}
