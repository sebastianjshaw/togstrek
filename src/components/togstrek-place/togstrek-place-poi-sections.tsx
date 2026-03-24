import Link from "next/link";

import {
  togstrekPoiGroupAnchorId,
  togstrekPoiGroupDisplayTitle,
  type TogstrekPlaceMdxPoiGroup,
} from "@/lib/togstrek-place-frontmatter";

export function TogstrekPlacePoiToc({
  groups,
}: {
  groups: TogstrekPlaceMdxPoiGroup[];
}) {
  if (groups.length === 0) return null;
  return (
    <nav
      className="togstrek-place-poi-toc border border-tt-border-muted bg-tt-surface-muted p-6 sm:p-8"
      aria-label="On this page"
    >
      <p className="font-tt-display text-tt-overline font-semibold uppercase tracking-tt-wide text-tt-accent">
        On this page
      </p>
      <ul className="mt-tt-4 space-y-tt-2 font-tt-body text-tt-small">
        {groups.map((g) => {
          const id = togstrekPoiGroupAnchorId(g.groupId);
          return (
            <li key={g.groupId}>
              <a
                href={`#${id}`}
                className="text-tt-text-secondary transition-colors hover:text-tt-accent"
              >
                {togstrekPoiGroupDisplayTitle(g)}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function TogstrekPlacePoiSections({
  groups,
}: {
  groups: TogstrekPlaceMdxPoiGroup[];
}) {
  if (groups.length === 0) return null;
  return (
    <div className="togstrek-place-poi-sections mt-tt-16 space-y-tt-16">
      {groups.map((g) => {
        const id = togstrekPoiGroupAnchorId(g.groupId);
        const heading = togstrekPoiGroupDisplayTitle(g);
        return (
          <section
            key={g.groupId}
            id={id}
            className="togstrek-place-poi-section scroll-mt-[calc(var(--tt-layout-header-height)+var(--tt-space-6))]"
            aria-labelledby={`togstrek-place-poi-heading-${id}`}
          >
            <h2
              id={`togstrek-place-poi-heading-${id}`}
              className="font-tt-display text-tt-title font-bold text-tt-text-primary"
            >
              {heading}
            </h2>
            <ul className="mt-tt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {g.items.map((item) => (
                <li
                  key={item.id}
                  className="togstrek-place-poi-item border border-tt-border-muted bg-tt-surface-base px-4 py-3"
                >
                  <p className="font-tt-body text-tt-small font-semibold text-tt-text-primary">
                    {item.externalUrl ? (
                      <Link
                        href={item.externalUrl}
                        className="text-tt-text-primary underline decoration-tt-border-muted underline-offset-2 transition-colors hover:text-tt-accent hover:decoration-tt-accent"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.name}
                      </Link>
                    ) : (
                      item.name
                    )}
                    {item.kind ? (
                      <span className="ml-2 font-normal text-tt-text-tertiary">
                        ({item.kind})
                      </span>
                    ) : null}
                  </p>
                  {item.note ? (
                    <p className="mt-tt-2 font-tt-body text-tt-small leading-tt-snug text-tt-text-secondary">
                      {item.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
