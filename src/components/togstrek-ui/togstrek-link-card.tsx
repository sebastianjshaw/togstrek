import Image from "next/image";
import Link from "next/link";

import { togstrekUnoptimizedRemoteImageInDev } from "@/lib/togstrek-dev-remote-image";

type TogstrekLinkCardRegionProps = {
  variant: "region";
  href: string;
  title: string;
  description: string;
  gradient: string;
  imageSrc?: string;
  imageAlt?: string;
  featured?: boolean;
};

type TogstrekLinkCardCompactProps = {
  variant: "compact";
  href?: string;
  title: string;
  /** Secondary line (e.g. special territory note). */
  meta?: string;
  /** Optional context line under the title (e.g. country hub page quote). */
  quote?: string;
  /** Larger padding and type — continent hub country grid. */
  size?: "default" | "comfortable";
  /** Optional header photo (e.g. first place hero on country hub tiles). */
  imageSrc?: string;
  imageAlt?: string;
};

export type TogstrekLinkCardProps =
  | TogstrekLinkCardRegionProps
  | TogstrekLinkCardCompactProps;

const togstrekLinkCardCompactBaseClass =
  "togstrek-link-card togstrek-link-card--compact flex border font-tt-body transition-colors";

const togstrekLinkCardCompactSizeClass: Record<
  NonNullable<TogstrekLinkCardCompactProps["size"]>,
  string
> = {
  default:
    "min-h-12 w-full min-w-0 flex-1 px-4 py-3 text-[length:var(--tt-text-small)]",
  comfortable:
    "min-h-[5.25rem] w-full min-w-0 flex-1 px-5 py-4 text-[length:var(--tt-text-body)] sm:min-h-[5.75rem] sm:px-6 sm:py-5",
};

const togstrekLinkCardCompactBodyPaddingClass: Record<
  NonNullable<TogstrekLinkCardCompactProps["size"]>,
  string
> = {
  default: "px-4 py-3 text-[length:var(--tt-text-small)]",
  comfortable: "px-5 py-4 sm:px-6 sm:py-5 text-[length:var(--tt-text-body)]",
};

function TogstrekLinkCardCompactText({
  title,
  quote,
  meta,
  size,
  titleTone,
}: {
  title: string;
  quote?: string;
  meta?: string;
  size: NonNullable<TogstrekLinkCardCompactProps["size"]>;
  titleTone: "linked" | "static";
}) {
  const titleClass =
    titleTone === "linked"
      ? "font-semibold text-tt-text-primary"
      : "font-semibold";
  const quoteClass =
    size === "comfortable"
      ? "text-[length:var(--tt-text-small)]"
      : "text-[length:var(--tt-text-overline)]";
  const quoteColor =
    titleTone === "linked" ? "text-tt-text-secondary" : "";

  return (
    <>
      <span className={titleClass}>{title}</span>
      {quote ? (
        <span
          className={`mt-2 block max-w-prose whitespace-pre-line font-tt-body italic leading-[var(--tt-leading-relaxed)] ${quoteClass} ${quoteColor}`}
        >
          {quote}
        </span>
      ) : null}
      {meta ? (
        <span
          className={`text-[length:var(--tt-text-overline)] leading-snug ${
            titleTone === "linked" ? "text-tt-text-tertiary" : ""
          } ${quote ? "mt-2" : "mt-1"}`}
        >
          {meta}
        </span>
      ) : null}
    </>
  );
}

/**
 * Shared interactive tile language: region “Where to” cards and hub list rows
 * use the same border, hover, and type scale.
 */
export function TogstrekLinkCard(props: TogstrekLinkCardProps) {
  if (props.variant === "compact") {
    const {
      href,
      title,
      meta,
      quote,
      size = "default",
      imageSrc,
      imageAlt,
    } = props;
    const sizeClass = togstrekLinkCardCompactSizeClass[size];
    const bodyPadClass = togstrekLinkCardCompactBodyPaddingClass[size];
    const stacked = Boolean(meta || quote);
    const linkedLayout = stacked
      ? "flex flex-col justify-center"
      : "flex items-center";
    const hasHeaderImage = Boolean(imageSrc);

    if (hasHeaderImage) {
      const imageBlock = (
        <div className="togstrek-link-card-compact-header-image relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-tt-surface-muted">
          <Image
            src={imageSrc!}
            alt={imageAlt ?? ""}
            fill
            unoptimized={togstrekUnoptimizedRemoteImageInDev(imageSrc!)}
            className="object-cover object-center transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-[1.03]"
            sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 33vw"
          />
        </div>
      );
      const body = (
        <div
          className={`togstrek-link-card-compact-body flex min-h-0 flex-1 flex-col justify-center ${bodyPadClass}`}
        >
          <TogstrekLinkCardCompactText
            title={title}
            quote={quote}
            meta={meta}
            size={size}
            titleTone={href ? "linked" : "static"}
          />
        </div>
      );

      if (href) {
        return (
          <Link
            href={href}
            className={`${togstrekLinkCardCompactBaseClass} togstrek-link-card--compact-linked togstrek-link-card--compact-has-header-image group min-h-0 w-full flex-1 flex-col overflow-hidden border-tt-border-muted bg-tt-surface-base p-0 text-tt-text-secondary hover:border-tt-accent hover:text-tt-accent`}
          >
            {imageBlock}
            {body}
          </Link>
        );
      }

      return (
        <span
          className={`${togstrekLinkCardCompactBaseClass} togstrek-link-card--compact-static togstrek-link-card--compact-has-header-image group min-h-0 w-full flex-1 flex-col overflow-hidden border-tt-border-muted/60 bg-tt-surface-muted/80 p-0 text-tt-text-tertiary`}
          title="No hub page yet"
        >
          {imageBlock}
          {body}
        </span>
      );
    }

    if (href) {
      return (
        <Link
          href={href}
          className={`${togstrekLinkCardCompactBaseClass} ${sizeClass} togstrek-link-card--compact-linked min-h-0 ${linkedLayout} border-tt-border-muted bg-tt-surface-base text-tt-text-secondary hover:border-tt-accent hover:text-tt-accent`}
        >
          <TogstrekLinkCardCompactText
            title={title}
            quote={quote}
            meta={meta}
            size={size}
            titleTone="linked"
          />
        </Link>
      );
    }

    return (
      <span
        className={`${togstrekLinkCardCompactBaseClass} ${sizeClass} togstrek-link-card--compact-static min-h-0 ${linkedLayout} cursor-default border-tt-border-muted/60 bg-tt-surface-muted/80 text-tt-text-tertiary`}
        title="No hub page yet"
      >
        <TogstrekLinkCardCompactText
          title={title}
          quote={quote}
          meta={meta}
          size={size}
          titleTone="static"
        />
      </span>
    );
  }

  const {
    href,
    title,
    description,
    gradient,
    imageSrc,
    imageAlt,
    featured,
  } = props;
  const isFeatured = Boolean(featured);
  const hasImage = Boolean(imageSrc);

  return (
    <Link
      href={href}
      className={`togstrek-link-card togstrek-link-card--region group relative flex min-h-[var(--tt-region-card-min-height)] flex-col justify-end overflow-hidden rounded-[var(--tt-radius-editorial-xl)] border border-tt-border-muted bg-tt-surface-base shadow-[var(--tt-shadow-photo)] transition-[transform,box-shadow,border-color] duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:border-[length:var(--tt-border-width-thick)] after:border-transparent after:transition-colors hover:-translate-y-1 hover:shadow-[var(--tt-shadow-photo-hover)] hover:after:border-tt-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tt-accent focus-visible:ring-offset-2 ${
        isFeatured ? "lg:min-h-[var(--tt-region-card-featured-min-height)]" : ""
      }`}
    >
      {hasImage && imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            unoptimized={togstrekUnoptimizedRemoteImageInDev(imageSrc)}
            className="object-cover object-center transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-[1.04]"
            sizes={
              isFeatured
                ? "(max-width:768px) 100vw, 90rem"
                : "(max-width:768px) 100vw, 50vw"
            }
          />
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_88%,transparent)] via-[color-mix(in_srgb,var(--tt-color-ink-strong)_35%,transparent)] to-[color-mix(in_srgb,var(--tt-color-ink-strong)_12%,transparent)]"
            aria-hidden
          />
        </>
      ) : (
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-95 transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-105`}
          aria-hidden
        />
      )}

      <div
        className={`relative z-[1] p-6 sm:p-8 ${isFeatured ? "sm:p-10" : ""}`}
      >
        <span
          className={`font-tt-display font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse ${
            isFeatured
              ? "text-[clamp(1.65rem,4.5vw,3.25rem)] leading-[var(--tt-leading-tight)]"
              : "text-[length:var(--tt-text-title)]"
          }`}
        >
          {title}
        </span>
        <p
          className={`mt-3 max-w-[min(40ch,100%)] font-tt-body text-tt-text-inverse/90 [overflow-wrap:anywhere] ${
            isFeatured
              ? "text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)]"
              : "text-[length:var(--tt-text-small)]"
          }`}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}
