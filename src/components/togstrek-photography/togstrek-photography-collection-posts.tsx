import { TogstrekPhotographyFeaturedGrid } from "@/components/togstrek-photography/togstrek-photography-featured-grid";
import type { TogstrekPhotographyHubFeatured } from "@/data/togstrek-photography-hub";
import { loadTogstrekPhotographyFrontmatterOnly } from "@/lib/togstrek-load-photography-mdx";
import { formatTogstrekDisplayDate } from "@/lib/togstrek-display-date";
import { listTogstrekPhotographySlugListsInCategory } from "@/lib/togstrek-photography-nav";

type TogstrekPhotographyCollectionPostsProps = {
  /** Collection slug, e.g. `art-nude` — a post's `collections` frontmatter. */
  collection: string;
};

function collectionLabel(collection: string): string {
  return collection.replace(/-/g, " ");
}

/**
 * Every post in an Other Work collection as compact cards, newest first —
 * same card layout as the featured row on the hub.
 */
export function TogstrekPhotographyCollectionPosts({
  collection,
}: TogstrekPhotographyCollectionPostsProps) {
  const posts = listTogstrekPhotographySlugListsInCategory(collection)
    .map((segments) => {
      const fm = loadTogstrekPhotographyFrontmatterOnly(segments);
      const date = formatTogstrekDisplayDate(fm.published) ?? "";
      const item: TogstrekPhotographyHubFeatured = {
        href: `/photography/${segments.join("/")}`,
        title: fm.title,
        imageSrc: fm.heroImage?.src ?? "",
        imageAlt: fm.heroImage?.alt ?? fm.title,
        date,
      };
      return item;
    })
    .filter((item) => item.imageSrc !== "")
    .sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        a.title.localeCompare(b.title, "en", { sensitivity: "base" }),
    );

  if (posts.length === 0) return null;

  return (
    <div className="togstrek-photography-collection-posts not-prose w-full max-w-none">
      <TogstrekPhotographyFeaturedGrid
        items={posts}
        ariaLabel={`Posts: ${collectionLabel(collection)}`}
        className="mt-[var(--tt-space-6)]"
      />
    </div>
  );
}
