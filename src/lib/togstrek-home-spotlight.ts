import {
  togstrekAdventuresMegaFeaturedCards,
  type TogstrekAdventuresMegaFeaturedCard,
} from "@/data/togstrek-adventures-mega-menu";
import type { TogstrekFeaturedAdventureContent } from "@/data/togstrek-featured-adventure-content";
import { togstrekFeaturedAlpineAdventure } from "@/data/togstrek-featured-alpine-adventure";

function megaCardToSpotlightContent(
  card: TogstrekAdventuresMegaFeaturedCard,
): TogstrekFeaturedAdventureContent {
  return {
    href: card.href,
    imageSrc: card.imageSrc,
    imageAlt: card.imageAlt,
    title: card.title,
    tagline: card.spotlightTagline,
    body: "",
    ctaLabel: card.spotlightCtaLabel ?? "Open adventure",
    kickerHome: togstrekFeaturedAlpineAdventure.kickerHome,
    kickerHub: togstrekFeaturedAlpineAdventure.kickerHub,
  };
}

function alpineSpotlightContent(): TogstrekFeaturedAdventureContent {
  const a = togstrekFeaturedAlpineAdventure;
  return {
    href: a.href,
    imageSrc: a.imageSrc,
    imageAlt: a.imageAlt,
    title: a.title,
    tagline: a.tagline,
    body: a.body,
    ctaLabel: a.ctaLabel,
    kickerHome: a.kickerHome,
    kickerHub: a.kickerHub,
  };
}

/**
 * Adventures shown in the primary nav mega menu, plus the Alpine long-form story,
 * for a single random homepage spotlight per request.
 */
export function buildTogstrekHomeSpotlightPool(): TogstrekFeaturedAdventureContent[] {
  return [
    ...togstrekAdventuresMegaFeaturedCards.map(megaCardToSpotlightContent),
    alpineSpotlightContent(),
  ];
}

export function pickRandomHomeSpotlightAdventure(): TogstrekFeaturedAdventureContent {
  const pool = buildTogstrekHomeSpotlightPool();
  const i = Math.floor(Math.random() * pool.length);
  return pool[i]!;
}
