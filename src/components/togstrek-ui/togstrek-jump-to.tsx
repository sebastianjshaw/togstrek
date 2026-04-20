import { TOGSTREK_BODY_LINK_CLASSNAME } from "@/components/togstrek-ui/togstrek-body-link";
import type { TogstrekJumpToItem } from "@/lib/remark-togstrek-jump-to";

function decodePayload(payload: string): TogstrekJumpToItem[] {
  const json = Buffer.from(payload, "base64").toString("utf8");
  return JSON.parse(json) as TogstrekJumpToItem[];
}

/**
 * In-page section list built at compile time from `##` / `###` headings (same
 * slug algorithm as `rehype-slug`). Injected or filled by `remark-togstrek-jump-to`.
 * Add `<TogstrekJumpTo />` (no attrs) in MDX to pin the nav there and skip the
 * default auto-insert after the first paragraph.
 */
export function TogstrekJumpTo({ payload }: { payload: string }) {
  let items: TogstrekJumpToItem[];
  try {
    items = decodePayload(payload);
  } catch {
    return null;
  }
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="On this page"
      className="togstrek-jump-to-nav mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)]"
    >
      <p className="togstrek-jump-to-nav-label font-tt-body text-[length:var(--tt-text-body)] font-semibold text-tt-text-primary">
        Jump to…
      </p>
      <ol className="togstrek-jump-to-nav-list mt-[var(--tt-space-3)] list-decimal pl-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
        {items.map((item) => (
          <li key={item.id} className="togstrek-jump-to-nav-item mt-2">
            <a
              href={`#${item.id}`}
              className={`togstrek-jump-to-nav-link ${TOGSTREK_BODY_LINK_CLASSNAME}`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
