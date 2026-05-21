import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  countPlacesInEnglandCounty,
  discoverEnglandCountyDirectorySlugs,
} from "@/lib/togstrek-england-counties";
import { togstrekHubStripGradientId } from "@/data/togstrek-card-gradients";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import { togstrekPlaceMdxExists } from "@/lib/togstrek-load-place-mdx";

function countySlugsForHubCards(): string[] {
  return discoverEnglandCountyDirectorySlugs().filter(
    (county) =>
      !togstrekPlaceMdxExists("europe", "united-kingdom", ["england", county]),
  );
}

/** County cards linking to `/europe/united-kingdom/england/{county}` hubs. */
export function TogstrekEnglandCountiesStrip() {
  const slugs = countySlugsForHubCards();

  return (
    <section aria-labelledby="togstrek-england-counties-heading">
      <TogstrekSectionHeader
        id="togstrek-england-counties-heading"
        title="Counties"
        description="Browse place stories by historic county — or scroll for every location in England below."
      />
      <ul className="togstrek-england-counties-strip-list mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug, i) => {
          const label = formatSlugLabel(slug);
          const n = countPlacesInEnglandCounty(slug);
          const gradient = togstrekHubStripGradientId(i);
          return (
            <li key={slug} className="min-w-0">
              <TogstrekLinkCard
                variant="region"
                href={`/europe/united-kingdom/england/${slug}`}
                title={label}
                description={
                  n === 1
                    ? "1 place story in this county."
                    : `${n} place stories in this county.`
                }
                gradient={gradient}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
