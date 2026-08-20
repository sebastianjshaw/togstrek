import type { ReactNode } from "react";

type TogstrekAdventureFeaturedSectionProps = {
  title?: string;
  /** Optional brief intro shown between the heading and the card grid. */
  description?: string;
  children: ReactNode;
};

/**
 * Grid wrapper for `TogstrekAdventureFeaturedPlace` blocks (Squarespace summary autogrid).
 */
export function TogstrekAdventureFeaturedSection({
  title = "Featured",
  description,
  children,
}: TogstrekAdventureFeaturedSectionProps) {
  return (
    <section
      className="togstrek-adventure-featured-section not-prose mt-[var(--tt-space-14)] w-full max-w-none border-t border-tt-border-muted pt-[var(--tt-space-10)]"
      aria-label={title || "Featured places"}
    >
      {title ? (
        <h2 className="togstrek-adventure-featured-section-heading font-tt-display text-[clamp(1.05rem,2.2vw,1.35rem)] font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary">
          {title}
        </h2>
      ) : null}
      {description?.trim() ? (
        <p className="togstrek-adventure-featured-section-description mt-[var(--tt-space-3)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
          {description}
        </p>
      ) : null}
      <div className="togstrek-adventure-featured-section-grid mt-[var(--tt-space-8)] grid grid-cols-1 gap-[var(--tt-space-8)] sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-10">
        {children}
      </div>
    </section>
  );
}
