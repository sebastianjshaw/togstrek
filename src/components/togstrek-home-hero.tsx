import Image from "next/image";
import Link from "next/link";

type TogstrekHomeHeroProps = {
  imageSrc: string;
  imageAlt: string;
};

export function TogstrekHomeHero({ imageSrc, imageAlt }: TogstrekHomeHeroProps) {
  return (
    <section
      className="togstrek-home-hero relative flex min-h-[min(88dvh,920px)] flex-col justify-end overflow-hidden sm:min-h-[min(92dvh,920px)]"
      aria-labelledby="togstrek-home-hero-heading"
    >
      <div className="togstrek-home-hero-media absolute inset-0">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
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
      </div>

      <div className="togstrek-home-hero-content relative z-[1] mx-auto w-full min-w-0 max-w-[var(--tt-layout-max-wide)] px-[var(--tt-layout-gutter)] pb-[max(var(--tt-space-16),env(safe-area-inset-bottom))] pt-[max(var(--tt-space-16),env(safe-area-inset-top))] sm:pt-[var(--tt-space-24)] md:pb-[var(--tt-space-20)]">
        <p className="togstrek-home-hero-eyebrow mb-[var(--tt-space-4)] font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-inverse/90">
          Travel · Photography · Photo essays
        </p>
        <h1
          id="togstrek-home-hero-heading"
          className="togstrek-home-hero-title max-w-[min(18ch,100%)] font-tt-display text-[length:var(--tt-text-hero)] font-extrabold leading-[var(--tt-leading-tight)] tracking-[var(--tt-tracking-tight)] text-tt-text-inverse [overflow-wrap:anywhere]"
        >
          The most exciting journey is the next one…
        </h1>
        <div className="togstrek-home-hero-rule my-[var(--tt-space-8)] h-1 w-24 bg-tt-accent shadow-[0_0_24px_color-mix(in_srgb,var(--tt-color-accent)_55%,transparent)]" />
        <p className="togstrek-home-hero-lead max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-inverse/92 [overflow-wrap:anywhere]">
          Curious travel guides and photo essays that go deeper — countries,
          cities, hikes, and the stories behind the frame.
        </p>
        <div className="togstrek-home-hero-actions mt-[var(--tt-space-10)] flex w-full max-w-lg flex-col gap-4 sm:max-w-none sm:flex-row sm:flex-wrap">
          <Link
            href="/europe"
            className="inline-flex min-h-12 w-full min-w-0 items-center justify-center border-[length:var(--tt-border-width-thick)] border-tt-accent bg-transparent px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent transition-colors duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] hover:bg-tt-accent hover:text-tt-text-inverse sm:w-auto sm:min-h-11 sm:px-8"
          >
            Explore regions
          </Link>
          <Link
            href="/about"
            className="inline-flex min-h-12 w-full min-w-0 items-center justify-center border border-tt-text-inverse/50 px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse transition-colors duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] hover:border-tt-text-inverse hover:bg-tt-text-inverse hover:text-tt-text-primary sm:w-auto sm:min-h-11 sm:px-8"
          >
            About the tog
          </Link>
        </div>
      </div>
    </section>
  );
}
