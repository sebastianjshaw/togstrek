import type { ReactNode } from "react";

type TogstrekPageTitleProps = {
  children: ReactNode;
  id?: string;
  className?: string;
};

/** Document H1 for simple text pages (about, map demo, no-hero place). */
export function TogstrekPageTitle({
  children,
  id,
  className,
}: TogstrekPageTitleProps) {
  return (
    <h1
      id={id}
      className={
        className
          ? `font-tt-display text-[length:var(--tt-text-display)] font-bold tracking-[var(--tt-tracking-tight)] text-tt-text-primary ${className}`
          : "font-tt-display text-[length:var(--tt-text-display)] font-bold tracking-[var(--tt-tracking-tight)] text-tt-text-primary"
      }
    >
      {children}
    </h1>
  );
}
