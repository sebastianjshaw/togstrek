"use client";

import { useState } from "react";

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
  const [adventure] = useState(() =>
    pickTogstrekHomeSpotlightAdventure(
      spotlightCandidates,
      defaultAdventure,
    ),
  );

  return (
    <TogstrekFeaturedAdventure
      layout="media"
      adventure={adventure}
      sectionAriaLabelledBy="togstrek-home-spotlight-heading"
    />
  );
}
