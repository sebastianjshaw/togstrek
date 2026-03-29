/**
 * Shape for `TogstrekFeaturedAdventure` — shared by the Alpine default, continent
 * hubs, and the homepage spotlight (including mega-menu adventures).
 */
export type TogstrekFeaturedAdventureContent = {
  href: string;
  imageSrc: string;
  imageAlt: string;
  title: string;
  tagline: string;
  /** Long intro — used by `layout="panel"` only. */
  body: string;
  ctaLabel: string;
  kickerHome: string;
  kickerHub: string;
};
