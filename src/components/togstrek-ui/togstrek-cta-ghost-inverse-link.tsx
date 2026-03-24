import Link from "next/link";
import type { ComponentProps } from "react";

const togstrekCtaGhostInverseClassName =
  "inline-flex min-h-12 w-full min-w-0 items-center justify-center border border-tt-text-inverse/50 px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse transition-colors duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] hover:border-tt-text-inverse hover:bg-tt-text-inverse hover:text-tt-text-primary sm:w-auto sm:min-h-11 sm:px-8";

type TogstrekCtaGhostInverseLinkProps = Omit<
  ComponentProps<typeof Link>,
  "className"
> & {
  className?: string;
};

export function TogstrekCtaGhostInverseLink({
  className,
  ...props
}: TogstrekCtaGhostInverseLinkProps) {
  return (
    <Link
      {...props}
      className={
        className
          ? `${togstrekCtaGhostInverseClassName} ${className}`
          : togstrekCtaGhostInverseClassName
      }
    />
  );
}
