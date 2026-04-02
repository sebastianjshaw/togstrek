import Image from "next/image";
import Link from "next/link";

import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import {
  TogstrekCtaOutlineAccentLink,
  togstrekCtaAccentSolidGroupClassName,
} from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";
import type { TogstrekFeaturedAdventureContent } from "@/data/togstrek-featured-adventure-content";
import { togstrekFeaturedAlpineAdventure } from "@/data/togstrek-featured-alpine-adventure";
import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";

function TogstrekFeaturedAdventureCtaLabelText({
  adventure,
}: {
  adventure: TogstrekFeaturedAdventureContent;
}) {
  const short = adventure.ctaLabelMobile ?? "Open adventure";
  return (
    <>
      <span className="sm:hidden">{short}</span>
      <span className="hidden sm:inline">{adventure.ctaLabel}</span>
    </>
  );
}

type TogstrekFeaturedAdventureLayout = "media" | "panel";

type TogstrekFeaturedAdventureProps = {
  layout: TogstrekFeaturedAdventureLayout;
  /** Defaults to Alpine adventure (continent hubs, etc.). */
  adventure?: TogstrekFeaturedAdventureContent;
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
        className="togstrek-featured-adventure togstrek-featured-adventure--media border-t border-tt-border-muted bg-tt-surface-muted py-[var(--tt-space-16)] md:py-[var(--tt-space-20)]"
        aria-labelledby={sectionAriaLabelledBy}
      >
        <TogstrekContentWidth>
          <Link
            href={adventure.href}
            className="togstrek-featured-adventure-card group relative flex min-h-[min(52vw,20rem)] w-full flex-col justify-end overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-base text-left shadow-[var(--tt-shadow-photo)] transition-[transform,box-shadow,border-color] duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:rounded-[inherit] after:border-[length:var(--tt-border-width-thick)] after:border-transparent after:transition-colors hover:-translate-y-1 hover:shadow-[var(--tt-shadow-photo-hover)] hover:after:border-tt-accent sm:min-h-[min(42vw,24rem)] md:aspect-[2.2/1] md:min-h-[min(36vh,26rem)]"
          >
            <Image
              src={adventure.imageSrc}
              alt={adventure.imageAlt}
              fill
              unoptimized={togstrekUnoptimizedRemoteImageInDev(adventure.imageSrc)}
              className="object-cover object-center transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-[1.03]"
              sizes="(max-width:768px) 100vw, 90rem"
            />
            <div
              className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_92%,transparent)] via-[color-mix(in_srgb,var(--tt-color-ink-strong)_45%,transparent)] to-[color-mix(in_srgb,var(--tt-color-ink-strong)_12%,transparent)]"
              aria-hidden
            />
            <div className="relative z-[3] p-6 sm:p-8 md:p-10">
              <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent">
                {kicker}
              </p>
              <h2
                id={sectionAriaLabelledBy}
                className="mt-[var(--tt-space-3)] max-w-[min(28ch,100%)] font-tt-display text-[clamp(1.5rem,4vw,2.75rem)] font-bold leading-[var(--tt-leading-tight)] tracking-[var(--tt-tracking-tight)] text-tt-text-inverse [overflow-wrap:anywhere]"
              >
                {adventure.title}
              </h2>
              <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse/90 [overflow-wrap:anywhere]">
                {adventure.tagline}
              </p>
              <span
                className={`togstrek-featured-adventure-cta pointer-events-none mt-[var(--tt-space-8)] ${togstrekCtaAccentSolidGroupClassName}`}
              >
                <TogstrekFeaturedAdventureCtaLabelText adventure={adventure} />
              </span>
            </div>
          </Link>
        </TogstrekContentWidth>
      </section>
    );
  }

  return (
    <section
      className="togstrek-featured-adventure togstrek-featured-adventure--panel overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-muted shadow-[var(--tt-shadow-photo)]"
      aria-labelledby={sectionAriaLabelledBy}
    >
      <div className="togstrek-featured-adventure-panel-grid grid grid-cols-1 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:items-stretch md:gap-0">
        <div className="togstrek-featured-adventure-panel-image-wrap relative order-1 aspect-[16/10] min-h-[12.5rem] w-full border-b border-tt-border-muted md:order-2 md:aspect-auto md:min-h-[min(22rem,42vh)] md:border-b-0 md:border-l md:border-tt-border-muted">
          <Image
            src={adventure.imageSrc}
            alt={adventure.imageAlt}
            fill
            unoptimized={togstrekUnoptimizedRemoteImageInDev(adventure.imageSrc)}
            className="object-cover object-center"
            sizes="(max-width:768px) 100vw, 42vw"
          />
        </div>
        <div className="togstrek-featured-adventure-panel-copy order-2 flex flex-col justify-center p-6 sm:p-8 md:order-1">
          <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent">
            {kicker}
          </p>
          <h2
            id={sectionAriaLabelledBy}
            className="mt-[var(--tt-space-3)] font-tt-display text-[length:var(--tt-text-title)] font-bold text-tt-text-primary"
          >
            {adventure.title}
          </h2>
          <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-secondary">
            {adventure.tagline}
          </p>
          <p className="mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            {adventure.body}
          </p>
          <TogstrekCtaOutlineAccentLink
            href={adventure.href}
            className="togstrek-featured-adventure-panel-cta mt-[var(--tt-space-8)] max-sm:whitespace-normal max-sm:py-2.5"
            aria-label={adventure.ctaLabel}
          >
            <TogstrekFeaturedAdventureCtaLabelText adventure={adventure} />
          </TogstrekCtaOutlineAccentLink>
        </div>
      </div>
    </section>
  );
}
