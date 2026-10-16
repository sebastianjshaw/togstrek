/**
 * Date text for “Published … · Updated …” lines.
 *
 * Frontmatter dates arrive either as plain `YYYY-MM-DD` or, on migrated pages,
 * as full ISO timestamps (`2009-01-31T00:00:00.000Z`). Readers only want the
 * day, so keep the leading calendar date and drop any time part. The date part
 * is sliced rather than round-tripped through `Date`, which would shift the
 * day in non-UTC time zones.
 */
const ISO_DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})(?:[T\s]|$)/;

export function formatTogstrekDisplayDate(
  value: string | undefined,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  return ISO_DATE_PREFIX.exec(trimmed)?.[1] ?? trimmed;
}
