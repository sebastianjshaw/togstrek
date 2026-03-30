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
  /**
   * Visible on narrow viewports when the full `ctaLabel` is long (e.g. “Open Alpine Adventure”).
   * Defaults to “Open adventure” in `TogstrekFeaturedAdventure` when omitted.
   */
  ctaLabelMobile?: string;
  kickerHome: string;
  kickerHub: string;
};
