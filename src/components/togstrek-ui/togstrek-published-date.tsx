import { formatTogstrekDisplayDate } from "@/lib/togstrek-display-date";

type TogstrekPublishedDateProps = {
  published?: string;
  modified?: string;
  /** When the YAML description lead is shown above, use a tighter top margin. */
  descriptionLeadShown: boolean;
  className?: string;
};

/**
 * “Published … · Updated …” line shared by article-style MDX page templates.
 */
export function TogstrekPublishedDate({
  published,
  modified,
  descriptionLeadShown,
  className,
}: TogstrekPublishedDateProps) {
  const pub = formatTogstrekDisplayDate(published);
  if (!pub) return null;
  const updated = formatTogstrekDisplayDate(modified);

  return (
    <p
      className={[
        "togstrek-published-date font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary",
        descriptionLeadShown
          ? "mt-[var(--tt-space-4)]"
          : "mt-[var(--tt-space-8)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      Published {pub}
      {updated ? ` · Updated ${updated}` : ""}
    </p>
  );
}
