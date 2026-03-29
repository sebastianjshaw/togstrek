import type { ReactNode } from "react";

/**
 * Shared UI copy for continent hub pages (`/europe`, `/[continent]`) so map and
 * country-list intros stay aligned and accurate.
 */

/** “On the map” section body — used on Europe and all dynamic continent hubs. */
export function togstrekHubOnTheMapSectionDescription(eyebrow: string): string {
  return `Where ${eyebrow} lives on my map — how many countries already have a hub, how many place stories are live, and a chart you can flip between country view and individual pins.`;
}

export const TOGSTREK_HUB_SPECIAL_TERRITORIES_SECTION_DESCRIPTION =
  "Territories with their own story collections — listed here so you can open them quickly; they don’t count as extra countries in the regional totals.";

export type TogstrekHubCountriesListIntroProps = {
  /** e.g. “in Europe” vs “in this region”. */
  regionPhrase: "in Europe" | "in this region";
  hubCount: number;
  total: number;
};

/**
 * Intro paragraph under the “Countries” heading — warm copy; counts still match
 * the sovereign-state set in `togstrek-un195-countries.ts`.
 */
export function TogstrekHubCountriesListIntro({
  regionPhrase,
  hubCount,
  total,
}: TogstrekHubCountriesListIntroProps): ReactNode {
  return (
    <>
      Every country {regionPhrase} that I track on the site is listed below — one
      steady roll-call so the map and the numbers tell the same story.{" "}
      <span className="text-tt-text-primary">
        {hubCount} of {total}
      </span>{" "}
      already open to a hub with published guides; the rest stay on the list so
      you can see what I haven’t written yet.
    </>
  );
}
