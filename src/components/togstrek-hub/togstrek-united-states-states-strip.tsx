import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  countPlacesInUnitedStatesState,
  discoverUnitedStatesStateDirectorySlugs,
  TOGSTREK_UNITED_STATES_CONTINENT,
  TOGSTREK_UNITED_STATES_COUNTRY,
} from "@/lib/togstrek-united-states-state-hubs";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import { togstrekPlaceMdxExists } from "@/lib/togstrek-load-place-mdx";

const TOGSTREK_UNITED_STATES_STATE_CARD_GRADIENTS = [
  "from-[#1a2332] via-[#2d4a3e] to-[#c4a574]/28",
  "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30",
  "from-[#1b2a1e] via-[#2f4a32] to-[#8fbc8f]/22",
  "from-[#2a1a14] via-[#4a2a18] to-[#e35d2d]/28",
  "from-[#1a1420] via-[#2d1f28] to-[#e31937]/28",
  "from-[#0f2d3a] via-[#1e5c6b] to-[#7ec8d3]/25",
] as const;

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
          const gradient =
            TOGSTREK_UNITED_STATES_STATE_CARD_GRADIENTS[
              i % TOGSTREK_UNITED_STATES_STATE_CARD_GRADIENTS.length
            ]!;
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
