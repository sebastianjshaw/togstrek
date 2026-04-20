import type { ReactNode } from "react";

type TogstrekDescriptionLeadProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Shared YAML `description` lead under the breadcrumb on article-style MDX pages
 * (place, hiking, adventure, other-work, photography).
 */
export function TogstrekDescriptionLead({
  children,
  className,
}: TogstrekDescriptionLeadProps) {
  return (
    <p
      className={[
        "togstrek-description-lead mt-[var(--tt-space-8)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </p>
  );
}
