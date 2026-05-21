import { TogstrekCdnImage } from "@/components/togstrek-ui/togstrek-cdn-image";
import Link from "next/link";

import { TOGSTREK_BODY_LINK_CLASSNAME } from "@/components/togstrek-ui/togstrek-body-link";

export type TogstrekAdventureFeaturedPlaceProps = {
  /** Internal path e.g. `/europe/iceland/vik`. Omit for a non-linked spotlight card. */
  href?: string;
  title: string;
  /** Visible date label, e.g. `Aug 5, 2023`. */
  date: string;
  /** Optional ISO date for `<time datetime="…">`. */
  dateTime?: string;
  /** Omit for a neutral placeholder tile (most migrated adventures have no per-place image). */
  imageSrc?: string;
  imageAlt?: string;
  excerpt?: string;
};

/**
 * Single “summary block” tile — thumbnail, date, linked title, excerpt — matching
 * the Squarespace 7.1 adventure layout.
 */
function titleInitial(title: string | undefined): string {
  const t = (title ?? "").trim();
  if (!t) return "?";
  const ch = [...t][0];
  return ch && /\p{L}/u.test(ch) ? ch.toUpperCase() : "?";
}

export function TogstrekAdventureFeaturedPlace({
  href,
  title,
  date,
  dateTime,
  imageSrc,
  imageAlt,
  excerpt,
}: TogstrekAdventureFeaturedPlaceProps) {
  const safeTitle = title ?? "";
  const safeDate = date ?? "";
  const hasImage = Boolean(imageSrc?.trim());
  const imageBlock = hasImage ? (
    <TogstrekCdnImage
      src={imageSrc!}
      alt={imageAlt ?? safeTitle}
      fill
      slot="adventureCard"
      className="object-cover transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-[1.03]"
    />
  ) : (
    <div
      className="togstrek-adventure-featured-place-image-placeholder flex size-full items-center justify-center bg-gradient-to-br from-tt-surface-muted via-tt-surface-base to-tt-accent/15"
      aria-hidden
    >
      <span className="font-tt-display text-[clamp(2.5rem,8vw,3.5rem)] font-extrabold tabular-nums text-tt-accent/35">
        {titleInitial(safeTitle)}
      </span>
    </div>
  );

  return (
    <article className="togstrek-adventure-featured-place-card flex min-w-0 flex-col overflow-hidden rounded-[var(--tt-radius-photo)] border border-tt-border-muted bg-tt-surface-base shadow-[var(--tt-shadow-sm)] transition-[box-shadow,transform] duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] [overflow-wrap:anywhere] hover:-translate-y-0.5 hover:shadow-[var(--tt-shadow-elevated)]">
      <div className="togstrek-adventure-featured-place-image relative aspect-[3/2] w-full overflow-hidden bg-tt-surface-muted">
        {href ? (
          <Link
            href={href}
            className="togstrek-adventure-featured-place-image-link group relative block size-full"
          >
            {imageBlock}
          </Link>
        ) : (
          <div className="relative size-full">{imageBlock}</div>
        )}
      </div>
      <div className="togstrek-adventure-featured-place-body flex flex-1 flex-col gap-[var(--tt-space-2)] p-4 sm:p-5">
        <time
          className="font-tt-body text-[length:var(--tt-text-small)] tabular-nums text-tt-text-tertiary"
          dateTime={dateTime}
        >
          {safeDate}
        </time>
        <h3 className="font-tt-display text-[length:var(--tt-text-lead)] font-semibold leading-[var(--tt-leading-snug)] text-tt-text-primary">
          {href ? (
            <Link href={href} className={TOGSTREK_BODY_LINK_CLASSNAME}>
              {safeTitle}
            </Link>
          ) : (
            safeTitle
          )}
        </h3>
        {excerpt?.trim() ? (
          <p className="font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            {excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
