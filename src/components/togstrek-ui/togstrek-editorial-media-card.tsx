import Image from "next/image";
import Link from "next/link";

/**
 * Editorial media card — design spec: `docs/design-system.md` (lift, scrims, micro-CTA).
 * Tokens: `--tt-radius-editorial-xl`, `--tt-editorial-accent-bar-height`, `--tt-duration-slower`.
 */
export type TogstrekEditorialMediaCardProps = {
  href: string;
  imageSrc: string;
  /**
   * Use `""` when the visible title inside the link is sufficient (avoids duplicate SR/SEO noise).
   */
  imageAlt?: string;
  overline: string;
  title: string;
  /** Shown on hover (always visible when `prefers-reduced-motion: reduce`). */
  microCtaLabel?: string;
  sizes?: string;
  className?: string;
};

export function TogstrekEditorialMediaCard({
  href,
  imageSrc,
  imageAlt = "",
  overline,
  title,
  microCtaLabel,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  className,
}: TogstrekEditorialMediaCardProps) {
  const rootClass = [
    "togstrek-editorial-media-card group relative block rounded-[length:var(--tt-radius-editorial-xl)] outline-none",
    "focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-4 focus-visible:ring-offset-tt-surface-base",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const frameClass = [
    "togstrek-editorial-media-card-frame relative aspect-[3/2] overflow-hidden rounded-[length:var(--tt-radius-editorial-xl)] bg-tt-surface-muted",
    "shadow-[var(--tt-shadow-sm)] ring-1 ring-tt-border-muted",
    "transition-[transform,box-shadow,ring-color] duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] will-change-transform",
    "group-hover:-translate-y-2 group-hover:shadow-[var(--tt-shadow-elevated)] group-hover:ring-tt-accent/40",
    "motion-reduce:transition-none motion-reduce:group-hover:translate-y-0 motion-reduce:group-hover:shadow-[var(--tt-shadow-sm)] motion-reduce:group-hover:ring-tt-border-muted",
  ].join(" ");

  return (
    <Link href={href} className={rootClass}>
      <div className={frameClass}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[length:var(--tt-editorial-accent-bar-height)] origin-left scale-x-0 rounded-t-[length:var(--tt-radius-editorial-xl)] bg-gradient-to-r from-tt-accent via-tt-accent/80 to-transparent transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-x-100 motion-reduce:scale-x-100 motion-reduce:group-hover:scale-x-100"
          aria-hidden
        />
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover transition-[transform,filter] duration-[var(--tt-duration-slower)] ease-[var(--tt-ease-out)] group-hover:scale-[1.07] group-hover:brightness-[1.05] group-hover:contrast-[1.03] motion-reduce:group-hover:scale-100 motion-reduce:group-hover:brightness-100 motion-reduce:group-hover:contrast-100"
          sizes={sizes}
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-[radial-gradient(ellipse_85%_65%_at_50%_35%,transparent_0%,color-mix(in_srgb,var(--tt-color-ink-strong)_38%,transparent)_100%)] opacity-50 mix-blend-multiply transition-opacity duration-[var(--tt-duration-slow)] group-hover:opacity-70 motion-reduce:group-hover:opacity-50"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 top-[28%] bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_94%,transparent)] via-[color-mix(in_srgb,var(--tt-color-ink-strong)_50%,transparent)] to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[inherit] bg-tt-accent/0 transition-colors duration-[var(--tt-duration-slow)] group-hover:bg-tt-accent/[0.12]"
          aria-hidden
        />
        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col justify-end p-5 sm:p-6">
          <p className="font-tt-display text-[length:var(--tt-text-overline)] font-bold uppercase tracking-[var(--tt-tracking-overline)] text-tt-accent [text-shadow:0_1px_14px_rgba(0,0,0,0.9)]">
            {overline}
          </p>
          <h3 className="mt-[var(--tt-space-2)] font-tt-display text-[clamp(1.05rem,2.6vw,1.3rem)] font-extrabold leading-[var(--tt-leading-snug)] text-tt-text-inverse [text-shadow:0_2px_24px_rgba(0,0,0,0.75)]">
            {title}
          </h3>
          {microCtaLabel ? (
            <span
              className="togstrek-editorial-media-card-micro-cta mt-[var(--tt-space-4)] inline-flex max-w-full items-center gap-2 font-tt-body text-[length:var(--tt-text-small)] font-semibold text-tt-text-inverse/95 transition-[transform,opacity] duration-[var(--tt-duration-micro-reveal)] ease-[var(--tt-ease-out)] translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:translate-y-0 motion-reduce:opacity-100"
              aria-hidden
            >
              <span
                className="h-px w-8 shrink-0 bg-gradient-to-r from-tt-accent to-transparent"
                aria-hidden
              />
              {microCtaLabel}
              <span
                className="inline-block transition-transform duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] group-hover:translate-x-1 motion-reduce:group-hover:translate-x-0"
                aria-hidden
              >
                →
              </span>
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
