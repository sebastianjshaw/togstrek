import Link from "next/link";
import type { ComponentProps } from "react";

const togstrekCtaOutlineAccentBase =
  "inline-flex w-full min-w-0 items-center justify-center border-[length:var(--tt-border-width-thick)] border-solid border-tt-accent bg-transparent px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase leading-5 tracking-[var(--tt-tracking-wide)] whitespace-nowrap text-tt-accent transition-colors duration-[var(--tt-duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 focus-visible:ring-offset-tt-surface-base sm:w-auto sm:min-w-[120px] sm:px-8";

const togstrekCtaSolidAccentBase =
  "inline-flex w-full min-w-0 items-center justify-center border-[length:var(--tt-border-width-thick)] border-solid border-tt-accent bg-tt-accent px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase leading-5 tracking-[var(--tt-tracking-wide)] whitespace-nowrap text-tt-text-inverse transition-colors duration-[var(--tt-duration-normal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-text-inverse focus-visible:ring-offset-2 focus-visible:ring-offset-tt-accent sm:w-auto sm:min-w-[120px] sm:px-8";

const heightDefault = "min-h-12";
const heightCompact = "min-h-10";

const hoverFillTail =
  "hover:bg-tt-accent hover:text-tt-text-inverse";
const groupHoverFillTail =
  "group-hover:bg-tt-accent group-hover:text-tt-text-inverse";

const solidHoverTail =
  "hover:border-tt-accent-hover hover:bg-tt-accent-hover";
const groupSolidHoverTail =
  "group-hover:border-tt-accent-hover group-hover:bg-tt-accent-hover";

export type TogstrekCtaOutlineAccentInteraction = "hover" | "group-hover";
export type TogstrekCtaOutlineAccentSize = "default" | "compact";
export type TogstrekCtaOutlineAccentAppearance = "outline" | "solid";

/** Builds outline- or solid-accent CTA classes (Figma *Link / CTA*). Use for `<span>` / external `<a>` when `Link` is not suitable. */
export function buildTogstrekCtaOutlineAccentClassName(options?: {
  interaction?: TogstrekCtaOutlineAccentInteraction;
  size?: TogstrekCtaOutlineAccentSize;
  appearance?: TogstrekCtaOutlineAccentAppearance;
}): string {
  const interaction = options?.interaction ?? "hover";
  const size = options?.size ?? "default";
  const appearance = options?.appearance ?? "outline";
  const height = size === "compact" ? heightCompact : heightDefault;

  if (appearance === "solid") {
    const hover =
      interaction === "group-hover" ? groupSolidHoverTail : solidHoverTail;
    return `${togstrekCtaSolidAccentBase} ${height} ${hover}`;
  }

  const fill =
    interaction === "group-hover" ? groupHoverFillTail : hoverFillTail;
  return `${togstrekCtaOutlineAccentBase} ${height} ${fill}`;
}

/** Default: direct hover; `min-h-12` (48px). */
export const togstrekCtaOutlineAccentClassName =
  buildTogstrekCtaOutlineAccentClassName();

/** Same visuals when the control sits inside a parent `group` (e.g. full-card link). */
export const togstrekCtaOutlineAccentGroupClassName =
  buildTogstrekCtaOutlineAccentClassName({ interaction: "group-hover" });

/** Solid accent (inverse text) for dark hero / scrim — WCAG-friendly vs outline on near-black. */
export const togstrekCtaAccentSolidClassName =
  buildTogstrekCtaOutlineAccentClassName({ appearance: "solid" });

/** Solid accent with `group-hover` lift — e.g. featured adventure media card. */
export const togstrekCtaAccentSolidGroupClassName =
  buildTogstrekCtaOutlineAccentClassName({
    appearance: "solid",
    interaction: "group-hover",
  });

type TogstrekCtaOutlineAccentLinkProps = Omit<
  ComponentProps<typeof Link>,
  "className"
> & {
  className?: string;
  interaction?: TogstrekCtaOutlineAccentInteraction;
  size?: TogstrekCtaOutlineAccentSize;
  appearance?: TogstrekCtaOutlineAccentAppearance;
};

/** Primary outline or solid CTA — shared across hero, featured blocks, hubs, nav, and map popups. */
export function TogstrekCtaOutlineAccentLink({
  className,
  interaction = "hover",
  size = "default",
  appearance = "outline",
  ...props
}: TogstrekCtaOutlineAccentLinkProps) {
  const built = buildTogstrekCtaOutlineAccentClassName({
    interaction,
    size,
    appearance,
  });
  return (
    <Link
      {...props}
      className={
        className ? `${built} ${className}` : built
      }
    />
  );
}

export type TogstrekCtaOutlineAccentExternalLinkProps = Omit<
  ComponentProps<"a">,
  "className"
> & {
  className?: string;
  interaction?: TogstrekCtaOutlineAccentInteraction;
  size?: TogstrekCtaOutlineAccentSize;
  appearance?: TogstrekCtaOutlineAccentAppearance;
};

/** Same CTA as `TogstrekCtaOutlineAccentLink` for external `https:` targets. */
export function TogstrekCtaOutlineAccentExternalLink({
  className,
  interaction = "hover",
  size = "default",
  appearance = "outline",
  ...props
}: TogstrekCtaOutlineAccentExternalLinkProps) {
  const built = buildTogstrekCtaOutlineAccentClassName({
    interaction,
    size,
    appearance,
  });
  return (
    <a
      {...props}
      className={className ? `${built} ${className}` : built}
    />
  );
}
