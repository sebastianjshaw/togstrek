"use client";

import { useEffect, useState } from "react";

import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import type { TogstrekFeaturedAdventureContent } from "@/data/togstrek-featured-adventure-content";

type TogstrekHomeSpotlightSectionProps = {
  defaultAdventure: TogstrekFeaturedAdventureContent;
  spotlightCandidates: TogstrekFeaturedAdventureContent[];
};

export function TogstrekHomeSpotlightSection({
  defaultAdventure,
  spotlightCandidates,
}: TogstrekHomeSpotlightSectionProps) {
  const [adventure, setAdventure] =
    useState<TogstrekFeaturedAdventureContent>(defaultAdventure);

  useEffect(() => {
    if (spotlightCandidates.length === 0) return;
    const i = Math.floor(Math.random() * spotlightCandidates.length);
    setAdventure(spotlightCandidates[i]!);
  }, [spotlightCandidates]);

  return (
    <TogstrekFeaturedAdventure
      layout="media"
      adventure={adventure}
      sectionAriaLabelledBy="togstrek-home-spotlight-heading"
    />
  );
}
