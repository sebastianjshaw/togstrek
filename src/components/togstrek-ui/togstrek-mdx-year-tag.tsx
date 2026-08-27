export type TogstrekMdxYearTagProps = {
  /** e.g. "2008" — rendered as "(2008)". */
  year?: string;
};

/**
 * Small muted year label for prefixing a paragraph on a place page that
 * blends narrative from multiple visits, e.g. `<TogstrekYearTag year="2008" />
 * I wandered out of the hotel...`. Inline (text-level) MDX usage, not a block.
 */
export function TogstrekMdxYearTag({ year }: TogstrekMdxYearTagProps) {
  if (!year) return null;

  return (
    <span className="togstrek-mdx-year-tag mr-2 font-tt-body text-[length:var(--tt-text-overline)] font-semibold tracking-[var(--tt-tracking-overline)] text-tt-text-tertiary">
      ({year})
    </span>
  );
}
