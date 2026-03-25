import Link from "next/link";
import type { ComponentProps } from "react";

const togstrekCtaOutlineAccentBase =
  "inline-flex w-full min-w-0 items-center justify-center border-[length:var(--tt-border-width-thick)] border-solid border-tt-accent bg-transparent px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase leading-5 tracking-[var(--tt-tracking-wide)] whitespace-nowrap text-tt-accent transition-colors duration-[var(--tt-duration-normal)] sm:w-auto sm:min-w-[120px] sm:px-8";

const heightDefault = "min-h-12";
const heightCompact = "min-h-10";

const hoverFillTail =
  "hover:bg-tt-accent hover:text-tt-text-inverse";
const groupHoverFillTail =
  "group-hover:bg-tt-accent group-hover:text-tt-text-inverse";

export type TogstrekCtaOutlineAccentInteraction = "hover" | "group-hover";
export type TogstrekCtaOutlineAccentSize = "default" | "compact";

/** Builds outline-accent CTA classes (Figma *Link / CTA*). Use for `<span>` / external `<a>` when `Link` is not suitable. */
export function buildTogstrekCtaOutlineAccentClassName(options?: {
  interaction?: TogstrekCtaOutlineAccentInteraction;
  size?: TogstrekCtaOutlineAccentSize;
}): string {
  const interaction = options?.interaction ?? "hover";
  const size = options?.size ?? "default";
  const height = size === "compact" ? heightCompact : heightDefault;
  const fill =
    interaction === "group-hover" ? groupHoverFillTail : hoverFillTail;
  return `${togstrekCtaOutlineAccentBase} ${height} ${fill}`;
}

/** Default: direct hover; `min-h-12` (48px). */
export const togstrekCtaOutlineAccentClassName = buildTogstrekCtaOutlineAccentClassName();

/** Same visuals when the control sits inside a parent `group` (e.g. full-card link). */
export const togstrekCtaOutlineAccentGroupClassName =
  buildTogstrekCtaOutlineAccentClassName({ interaction: "group-hover" });

type TogstrekCtaOutlineAccentLinkProps = Omit<
  ComponentProps<typeof Link>,
  "className"
> & {
  className?: string;
  interaction?: TogstrekCtaOutlineAccentInteraction;
  size?: TogstrekCtaOutlineAccentSize;
};

/** Primary outline CTA — shared across hero, featured blocks, hubs, nav, and map popups. */
export function TogstrekCtaOutlineAccentLink({
  className,
  interaction = "hover",
  size = "default",
  ...props
}: TogstrekCtaOutlineAccentLinkProps) {
  const built = buildTogstrekCtaOutlineAccentClassName({ interaction, size });
  return (
    <Link
      {...props}
      className={
        className ? `${built} ${className}` : built
      }
    />
  );
}
