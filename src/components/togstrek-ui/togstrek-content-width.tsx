import type { ReactNode } from "react";

export type TogstrekContentWidthMax = "wide" | "prose" | "content";

const togstrekContentWidthMaxClass: Record<TogstrekContentWidthMax, string> = {
  wide: "max-w-[var(--tt-layout-max-wide)]",
  prose: "max-w-[var(--tt-layout-max-prose)]",
  content: "max-w-[var(--tt-layout-max-content)]",
};

type TogstrekContentWidthProps = {
  children: ReactNode;
  max?: TogstrekContentWidthMax;
  className?: string;
};

/** Horizontal gutter + max width — use for every main column. */
export function TogstrekContentWidth({
  children,
  max = "wide",
  className,
}: TogstrekContentWidthProps) {
  const base =
    "mx-auto w-full min-w-0 px-tt-gutter " +
    togstrekContentWidthMaxClass[max];
  return (
    <div className={className ? `${base} ${className}` : base}>{children}</div>
  );
}
