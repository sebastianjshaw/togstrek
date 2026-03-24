import Image from "next/image";
import Link from "next/link";

/** Update when the featured trip changes — single source for home “latest adventure”. */
const togstrekLatestAdventure = {
  href: "/adventures/2018-alpine-adventure",
  imageSrc:
    "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1676558893598-X9ZAV37ZVOCFSNYWMUSF/22e59112fefb45ea.jpg?format=2500w",
  imageAlt:
    "Mountain landscape with snow-capped peaks, rocky terrain, and blue sky, intersected by cables.",
  title: "2018: Alpine Adventure",
  tagline:
    "The 50 countries who host both the largest and smallest nations in the world.",
} as const;

export function TogstrekHomeLatestAdventure() {
  const { href, imageSrc, imageAlt, title, tagline } = togstrekLatestAdventure;

  return (
    <section
      className="togstrek-home-latest-adventure border-t border-tt-border-muted bg-tt-surface-muted py-[var(--tt-space-16)] md:py-[var(--tt-space-20)]"
      aria-labelledby="togstrek-home-latest-adventure-heading"
    >
      <div className="mx-auto max-w-[var(--tt-layout-max-wide)] px-[var(--tt-layout-gutter)]">
        <Link
          href={href}
          className="togstrek-home-latest-adventure-card group relative flex min-h-[min(52vw,20rem)] w-full flex-col justify-end overflow-hidden border border-tt-border-muted bg-tt-surface-base shadow-[var(--tt-shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] after:pointer-events-none after:absolute after:inset-0 after:z-[2] after:border-[length:var(--tt-border-width-thick)] after:border-transparent after:transition-colors hover:-translate-y-1 hover:shadow-[var(--tt-shadow-elevated)] hover:after:border-tt-accent sm:min-h-[min(42vw,24rem)] md:aspect-[2.2/1] md:min-h-[min(36vh,26rem)]"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover object-center transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, min(90rem, 100vw)"
          />
          <div
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_92%,transparent)] via-[color-mix(in_srgb,var(--tt-color-ink-strong)_45%,transparent)] to-[color-mix(in_srgb,var(--tt-color-ink-strong)_12%,transparent)]"
            aria-hidden
          />
          <div className="relative z-[3] p-6 sm:p-8 md:p-10">
            <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent">
              Latest adventure
            </p>
            <h2
              id="togstrek-home-latest-adventure-heading"
              className="mt-[var(--tt-space-3)] max-w-[min(28ch,100%)] font-tt-display text-[clamp(1.5rem,4vw,2.75rem)] font-bold leading-[var(--tt-leading-tight)] tracking-[var(--tt-tracking-tight)] text-tt-text-inverse [overflow-wrap:anywhere]"
            >
              {title}
            </h2>
            <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse/90 [overflow-wrap:anywhere]">
              {tagline}
            </p>
            <span className="togstrek-home-latest-adventure-cta mt-[var(--tt-space-8)] inline-flex min-h-12 w-full min-w-0 items-center justify-center border-[length:var(--tt-border-width-thick)] border-tt-accent bg-transparent px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent transition-colors duration-[var(--tt-duration-normal)] group-hover:bg-tt-accent group-hover:text-tt-text-inverse sm:w-auto sm:px-8">
              Open Alpine Adventure
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
