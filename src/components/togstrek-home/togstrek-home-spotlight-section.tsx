"use client";

import { useEffect, useState } from "react";

import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import type { TogstrekFeaturedAdventureContent } from "@/data/togstrek-featured-adventure-content";

type TogstrekHomeSpotlightSectionProps = {
  defaultAdventure: TogstrekFeaturedAdventureContent;
  spotlightCandidates: TogstrekFeaturedAdventureContent[];
};

function pickTogstrekHomeSpotlightAdventure(
  candidates: TogstrekFeaturedAdventureContent[],
  fallback: TogstrekFeaturedAdventureContent,
): TogstrekFeaturedAdventureContent {
  if (candidates.length === 0) return fallback;
  const i = Math.floor(Math.random() * candidates.length);
  return candidates[i] ?? fallback;
}

export function TogstrekHomeSpotlightSection({
  defaultAdventure,
  spotlightCandidates,
}: TogstrekHomeSpotlightSectionProps) {
  /**
   * Render `defaultAdventure` for both the server pass and the first client
   * paint (so hydration matches exactly), then swap to a random pick once
   * mounted — `Math.random()` can't run during the lazy `useState` initializer
   * without the server and client picking different candidates.
   */
  const [adventure, setAdventure] = useState(defaultAdventure);

  useEffect(() => {
    setAdventure(
      pickTogstrekHomeSpotlightAdventure(spotlightCandidates, defaultAdventure),
    );
    // Pick once on mount; re-running on every candidate/default change would
    // re-randomize mid-visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TogstrekFeaturedAdventure
      layout="media"
      adventure={adventure}
      sectionAriaLabelledBy="togstrek-home-spotlight-heading"
    />
  );
}
