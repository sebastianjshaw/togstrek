import Image from "next/image";
import Link from "next/link";

import { TogstrekImageScrim } from "@/components/togstrek-ui/togstrek-image-scrim";

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
};

export type TogstrekLinkCardProps =
  | TogstrekLinkCardRegionProps
  | TogstrekLinkCardCompactProps;

const togstrekLinkCardCompactBaseClass =
  "togstrek-link-card togstrek-link-card--compact flex min-h-12 border px-4 py-3 font-tt-body text-tt-small transition-colors";

/**
 * Shared interactive tile language: region "Where to" cards and hub list rows
 * use the same border, hover, and type scale.
 */
export function TogstrekLinkCard(props: TogstrekLinkCardProps) {
  if (props.variant === "compact") {
    const { href, title, meta } = props;
    const linkedLayout = meta
      ? "flex flex-col justify-center"
      : "flex items-center";

    if (href) {
      return (
        <Link
          href={href}
          className={`${togstrekLinkCardCompactBaseClass} togstrek-link-card--compact-linked ${linkedLayout} border-tt-border-muted bg-tt-surface-base text-tt-text-secondary hover:border-tt-accent hover:text-tt-accent`}
        >
          <span className="font-semibold text-tt-text-primary">{title}</span>
          {meta ? (
            <span className="mt-tt-1 text-tt-overline leading-tt-snug text-tt-text-tertiary">
              {meta}
            </span>
          ) : null}
        </Link>
      );
    }

    return (
      <span
        className={`${togstrekLinkCardCompactBaseClass} togstrek-link-card--compact-static ${linkedLayout} cursor-default border-tt-border-muted/60 bg-tt-surface-muted/80 text-tt-text-tertiary`}
        title="No hub page yet"
      >
        <span className="font-semibold">{title}</span>
        {meta ? (
          <span className="mt-tt-1 text-tt-overline leading-tt-snug">
            {meta}
          </span>
        ) : null}
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
      className={`togstrek-link-card togstrek-link-card--region group relative flex min-h-[var(--tt-region-card-min-height)] flex-col justify-end overflow-hidden border border-tt-border-muted bg-tt-surface-base shadow-[var(--tt-shadow-sm)] transition-[transform,box-shadow,border-color] duration-tt-normal ease-tt-out after:pointer-events-none after:absolute after:inset-0 after:border-tt-thick after:border-transparent after:transition-colors hover:-translate-y-1 hover:shadow-[var(--tt-shadow-elevated)] hover:after:border-tt-accent ${
        isFeatured ? "lg:min-h-[var(--tt-region-card-featured-min-height)]" : ""
      }`}
    >
      {hasImage && imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            className="object-cover object-center transition-transform duration-tt-slow ease-tt-out group-hover:scale-[1.04]"
            sizes={
              isFeatured
                ? "(max-width:768px) 100vw, min(90rem, 100vw)"
                : "(max-width:768px) 100vw, 50vw"
            }
          />
          <TogstrekImageScrim />
        </>
      ) : (
        <div
          className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${gradient} opacity-95 transition-transform duration-tt-slow ease-tt-out group-hover:scale-105`}
          aria-hidden={true}
        />
      )}

      <div
        className={`relative z-[1] p-6 sm:p-8 ${isFeatured ? "sm:p-10" : ""}`}
      >
        <span
          className={`font-tt-display font-bold uppercase tracking-tt-wide text-tt-text-inverse ${
            isFeatured
              ? "text-tt-subhero leading-tt-tight"
              : "text-tt-title"
          }`}
        >
          {title}
        </span>
        <p
          className={`mt-3 max-w-[min(40ch,100%)] font-tt-body text-tt-text-inverse/90 [overflow-wrap:anywhere] ${
            isFeatured
              ? "text-tt-lead leading-tt-relaxed"
              : "text-tt-small"
          }`}
        >
          {description}
        </p>
      </div>
    </Link>
  );
}
