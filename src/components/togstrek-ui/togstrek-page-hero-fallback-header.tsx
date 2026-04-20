import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekPageTitle } from "@/components/togstrek-ui/togstrek-page-title";

export type TogstrekPageHeroFallbackHeaderProps = {
  title: string;
  /** Stable id for the document H1 (skip links, in-page anchors). */
  titleId: string;
  /**
   * When set, renders overline + display `h1` to mirror `TogstrekPageHero` article
   * typography on a muted band. Omit for the simpler `TogstrekPageTitle` layout.
   */
  eyebrow?: string;
};

/**
 * Muted full-width band used when MDX has no `heroImage` — keeps article pages
 * visually aligned with `TogstrekPageHero` without duplicating markup per template.
 */
export function TogstrekPageHeroFallbackHeader({
  title,
  titleId,
  eyebrow,
}: TogstrekPageHeroFallbackHeaderProps) {
  return (
    <header className="togstrek-page-hero-fallback-header border-b border-tt-border-muted bg-tt-surface-muted">
      <TogstrekContentWidth className="py-[var(--tt-space-12)]">
        {eyebrow ? (
          <>
            <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-accent">
              {eyebrow}
            </p>
            <h1
              id={titleId}
              className="mt-[var(--tt-space-3)] font-tt-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[var(--tt-leading-snug)] text-tt-text-primary"
            >
              {title}
            </h1>
          </>
        ) : (
          <TogstrekPageTitle id={titleId}>{title}</TogstrekPageTitle>
        )}
      </TogstrekContentWidth>
    </header>
  );
}
