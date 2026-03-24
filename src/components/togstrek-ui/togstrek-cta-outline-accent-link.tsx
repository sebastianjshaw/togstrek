import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

const togstrekCtaOutlineAccentBase =
  "inline-flex min-h-12 w-full min-w-0 items-center justify-center border-tt-thick border-tt-accent bg-transparent px-6 py-3 font-tt-display text-tt-small font-semibold uppercase tracking-tt-wide text-tt-accent transition-colors duration-tt-normal sm:w-auto sm:px-8";

/** Standard link variant — hover styles apply on self. */
const togstrekCtaOutlineAccentClassName =
  `${togstrekCtaOutlineAccentBase} hover:bg-tt-accent hover:text-tt-text-inverse`;

/** Group-child variant — hover styles triggered by parent group. */
const togstrekCtaOutlineAccentGroupClassName =
  `${togstrekCtaOutlineAccentBase} group-hover:bg-tt-accent group-hover:text-tt-text-inverse`;

type TogstrekCtaOutlineAccentAsLink = Omit<
  ComponentProps<typeof Link>,
  "className"
> & {
  className?: string;
  asGroupChild?: false;
};

type TogstrekCtaOutlineAccentAsSpan = {
  className?: string;
  /** Content of the span rendered inside a parent link. */
  children: ReactNode;
  /**
   * Renders as a `<span>` with group-hover styles for use inside a wrapping
   * `<Link>`. Avoids nesting `<a>` inside `<a>`.
   */
  asGroupChild: true;
};

export type TogstrekCtaOutlineAccentLinkProps =
  | TogstrekCtaOutlineAccentAsLink
  | TogstrekCtaOutlineAccentAsSpan;

/** Primary outline CTA — shared across hero, featured blocks, and hubs. */
export function TogstrekCtaOutlineAccentLink(
  props: TogstrekCtaOutlineAccentLinkProps,
) {
  if (props.asGroupChild) {
    const { className, children } = props;
    const base = togstrekCtaOutlineAccentGroupClassName;
    return (
      <span className={className ? `${base} ${className}` : base}>
        {children}
      </span>
    );
  }

  const { className, ...rest } = props;
  const base = togstrekCtaOutlineAccentClassName;
  return (
    <Link
      {...rest}
      className={className ? `${base} ${className}` : base}
    />
  );
}
