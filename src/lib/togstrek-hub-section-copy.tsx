import type { ReactNode } from "react";

/**
 * Shared UI copy for continent hub pages (`/europe`, `/[continent]`) so map and
 * country-list intros stay aligned and accurate.
 */

/** “On the map” section body — used on Europe and all dynamic continent hubs. */
export function togstrekHubOnTheMapSectionDescription(eyebrow: string): string {
  return `Live travel progress for ${eyebrow}: coverage against the UN country list, visited country and city counts, and an interactive map that switches between country and city views.`;
}

export const TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION =
  "Places with their own story collections — not counted as separate countries on the UN list.";

export type TogstrekHubCountriesListIntroProps = {
  /** e.g. “in Europe” vs “in this region”. */
  regionPhrase: "in Europe" | "in this region";
  hubCount: number;
  total: number;
};

/**
 * Intro paragraph under the “Countries” heading (UN 195 list + hub coverage counts).
 * Wording matches the dataset in `togstrek-un195-countries.ts` (193 members + Holy See + Palestine).
 */
export function TogstrekHubCountriesListIntro({
  regionPhrase,
  hubCount,
  total,
}: TogstrekHubCountriesListIntroProps): ReactNode {
  return (
    <>
      All sovereign states {regionPhrase} on the UN-style list of 195 (193 member
      states, plus the Holy See and Palestine as permanent observers).{" "}
      <span className="text-tt-text-primary">
        {hubCount} of {total}
      </span>{" "}
      have a hub page so far; others stay on the list for coverage at a glance.
    </>
  );
}
