import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  countPlacesInUnitedStatesState,
  discoverUnitedStatesStateDirectorySlugs,
  TOGSTREK_UNITED_STATES_CONTINENT,
  TOGSTREK_UNITED_STATES_COUNTRY,
} from "@/lib/togstrek-united-states-state-hubs";
import { togstrekHubStripGradientId } from "@/data/togstrek-card-gradients";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import { togstrekPlaceMdxExists } from "@/lib/togstrek-load-place-mdx";

function stateSlugsForHubCards(): string[] {
  return discoverUnitedStatesStateDirectorySlugs().filter(
    (state) =>
      !togstrekPlaceMdxExists(
        TOGSTREK_UNITED_STATES_CONTINENT,
        TOGSTREK_UNITED_STATES_COUNTRY,
        [state],
      ),
  );
}

/** State cards linking to `/{continent}/{country}/{state}` hubs. */
export function TogstrekUnitedStatesStatesStrip() {
  const slugs = stateSlugsForHubCards();

  return (
    <section aria-labelledby="togstrek-united-states-states-heading">
      <TogstrekSectionHeader
        id="togstrek-united-states-states-heading"
        title="States"
        description="Browse place stories by state — or scroll for every location in the United States below."
      />
      <ul className="togstrek-united-states-states-strip-list mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug, i) => {
          const label = formatSlugLabel(slug);
          const n = countPlacesInUnitedStatesState(slug);
          const gradient = togstrekHubStripGradientId(i);
          return (
            <li key={slug} className="min-w-0">
              <TogstrekLinkCard
                variant="region"
                href={`/${TOGSTREK_UNITED_STATES_CONTINENT}/${TOGSTREK_UNITED_STATES_COUNTRY}/${slug}`}
                title={label}
                description={
                  n === 1
                    ? "1 place story in this state."
                    : `${n} place stories in this state.`
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
