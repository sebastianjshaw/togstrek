import { togstrekMediaUrl } from "@/config/togstrek-media";
import type { TogstrekFeaturedAdventureContent } from "@/data/togstrek-featured-adventure-content";
import {
  adventureMdxExists,
  loadTogstrekAdventureFrontmatterOnly,
} from "@/lib/togstrek-adventure-content-fs";

const ALPINE_SLUG = "2018-alpine-adventure";

/**
 * Single source for the “Alpine Adventure” feature — continent hubs (panel) and
 * one option in the homepage spotlight pool. Copy and hero come from MDX when
 * `content/adventures/2018-alpine-adventure.mdx` exists.
 */
const FALLBACK: TogstrekFeaturedAdventureContent = {
  href: "/adventures/2018-alpine-adventure",
  imageSrc: togstrekMediaUrl("adventures/22e59112fefb45ea.jpg"),
  imageAlt:
    "Mountain landscape with snow-capped peaks, rocky terrain, and blue sky, intersected by cables.",
  title: "2018: Alpine Adventure",
  tagline:
    "Across Europe with a camera — fjords, capitals, and ridgelines in the same frame.",
  body:
    "Europe is a continent steeped in history, culture, and diverse landscapes. On Tog's Trek we wander cobblestone streets and mountain passes alike — from scenic fjords and Baltic harbours to the buzz of capital cities — with a camera and a notebook.",
  ctaLabel: "Open Alpine Adventure",
  kickerHome: "Spotlight",
  kickerHub: "Featured adventure",
};

function buildFeaturedAlpine(): TogstrekFeaturedAdventureContent {
  if (!adventureMdxExists(ALPINE_SLUG)) {
    return FALLBACK;
  }
  const fm = loadTogstrekAdventureFrontmatterOnly(ALPINE_SLUG);
  const hero = fm.heroImage;
  return {
    href: `/adventures/${ALPINE_SLUG}`,
    imageSrc: hero?.src ?? FALLBACK.imageSrc,
    imageAlt: hero?.alt ?? FALLBACK.imageAlt,
    title: fm.title,
    tagline: FALLBACK.tagline,
    body: FALLBACK.body,
    ctaLabel: FALLBACK.ctaLabel,
    kickerHome: FALLBACK.kickerHome,
    kickerHub: FALLBACK.kickerHub,
  };
}

export const togstrekFeaturedAlpineAdventure: TogstrekFeaturedAdventureContent =
  buildFeaturedAlpine();
