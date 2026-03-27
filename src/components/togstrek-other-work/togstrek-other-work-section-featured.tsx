import { TogstrekOtherWorkFeaturedGrid } from "@/components/togstrek-other-work/togstrek-other-work-featured-grid";
import { getTogstrekOtherWorkSectionFeatured } from "@/data/togstrek-other-work-section-featured";

type TogstrekOtherWorkSectionFeaturedProps = {
  /** Matches `content/other-work/{section}.mdx` basename (e.g. art-nude, street-photography). */
  section: string;
};

/**
 * Compact featured grid for portfolio section pages — same card layout as `/other-work` hub.
 * Data: `src/data/togstrek-other-work-section-featured.ts`.
 */
export function TogstrekOtherWorkSectionFeatured({
  section,
}: TogstrekOtherWorkSectionFeaturedProps) {
  const items = getTogstrekOtherWorkSectionFeatured(section);
  if (items.length === 0) return null;

  const label =
    section === "photography-guides"
      ? "Guides"
      : section.replace(/-/g, " ");

  return (
    <div className="togstrek-other-work-section-featured not-prose w-full max-w-none">
      <TogstrekOtherWorkFeaturedGrid
        items={items}
        ariaLabel={`Featured: ${label}`}
        className="mt-[var(--tt-space-6)]"
      />
    </div>
  );
}
