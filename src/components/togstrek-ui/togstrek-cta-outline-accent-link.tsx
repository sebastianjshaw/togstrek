import Link from "next/link";
import type { ComponentProps } from "react";

const togstrekCtaOutlineAccentClassName =
  "inline-flex min-h-12 w-full min-w-0 items-center justify-center border-[length:var(--tt-border-width-thick)] border-tt-accent bg-transparent px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent transition-colors duration-[var(--tt-duration-normal)] hover:bg-tt-accent hover:text-tt-text-inverse sm:w-auto sm:px-8";

type TogstrekCtaOutlineAccentLinkProps = Omit<
  ComponentProps<typeof Link>,
  "className"
> & {
  className?: string;
};

/** Primary outline CTA — shared across hero, featured blocks, and hubs. */
export function TogstrekCtaOutlineAccentLink({
  className,
  ...props
}: TogstrekCtaOutlineAccentLinkProps) {
  return (
    <Link
      {...props}
      className={
        className
          ? `${togstrekCtaOutlineAccentClassName} ${className}`
          : togstrekCtaOutlineAccentClassName
      }
    />
  );
}
