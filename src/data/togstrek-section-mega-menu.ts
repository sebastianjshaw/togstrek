/**
 * Hub links for Hiking and Other Work mega menus. Add entries here as you
 * migrate pages; paths follow `/hiking/...` and `/other-work/...`.
 */

export type TogstrekSectionMegaKey = "hiking" | "other-work";

export type TogstrekSectionMegaAside = {
  heading: string;
  /** When set, the aside heading is a link (e.g. Adventures → /adventures). */
  headingHref?: `/${string}`;
  links: { href: string; label: string }[];
};

export type TogstrekSectionMegaMenuDefinition = {
  key: TogstrekSectionMegaKey;
  navHref: `/${string}`;
  /** Label in the primary nav (sentence case). */
  navLabel: string;
  /** Large title inside the panel (e.g. “Hiking trails”). */
  panelHeading: string;
  tagline: string;
  links: { href: string; label: string }[];
  ctaLabel: string;
  ctaHref: `/${string}`;
  aside: TogstrekSectionMegaAside;
  /** Shown when `links` is empty (should not happen if data is maintained). */
  emptyStateMessage: string;
};

export const togstrekHikingMegaMenu: TogstrekSectionMegaMenuDefinition = {
  key: "hiking",
  navHref: "/hiking",
  navLabel: "Hiking",
  panelHeading: "Hiking trails",
  tagline:
    "SOMETIMES THE BEST WAY TO EXPLORE THE WORLD IS TO WALK EVERY INCH OF IT.",
  links: [
    { href: "/hiking/annapurna", label: "Annapurna" },
    { href: "/hiking/bohusleden", label: "Bohusleden" },
    { href: "/hiking/hoga-kusten", label: "Höga Kusten" },
    { href: "/hiking/kungsleden", label: "Kungsleden" },
    { href: "/hiking/kilimanjaro", label: "Kilimanjaro" },
    { href: "/hiking/tiveden", label: "Tiveden" },
    { href: "/hiking/utvandraleden", label: "Utvandraleden" },
  ].sort((a, b) => a.label.localeCompare(b.label)),
  ctaLabel: "See all hikes",
  ctaHref: "/hiking",
  aside: {
    heading: "Adventures",
    headingHref: "/adventures",
    links: [],
  },
  emptyStateMessage:
    "Trail pages are on the way — open Hiking for the full introduction.",
};

export const togstrekOtherWorkMegaMenu: TogstrekSectionMegaMenuDefinition = {
  key: "other-work",
  navHref: "/other-work",
  navLabel: "Other Work",
  panelHeading: "Other work",
  tagline:
    "EXPLORATION IS NOT JUST TRAVELLING. IT'S HOW YOU LOOK AT THE WORLD, HOW YOU TRY NEW THINGS, AND HOW YOU LEARN.",
  links: [
    { href: "/other-work/art-nude", label: "Art nude" },
    { href: "/other-work/astrophotography", label: "Astrophotography" },
    { href: "/other-work/avalon", label: "Avalon" },
    { href: "/other-work/events", label: "Events" },
    { href: "/other-work/fetish", label: "Fetish" },
    { href: "/other-work/photography-guides", label: "Guides" },
    { href: "/other-work/merlin", label: "Merlin" },
    { href: "/other-work/misc", label: "Misc" },
    { href: "/other-work/models", label: "Models & fashion" },
    { href: "/other-work/music", label: "Music" },
    { href: "/other-work/street-photography", label: "Street" },
  ].sort((a, b) => a.label.localeCompare(b.label)),
  ctaLabel: "All other work",
  ctaHref: "/other-work",
  aside: {
    heading: "About us",
    headingHref: "/about",
    links: [],
  },
  emptyStateMessage:
    "Galleries and series are on the way — open Other Work for the overview.",
};

export const togstrekSectionMegaMenuByKey: Record<
  TogstrekSectionMegaKey,
  TogstrekSectionMegaMenuDefinition
> = {
  hiking: togstrekHikingMegaMenu,
  "other-work": togstrekOtherWorkMegaMenu,
};

export const togstrekSectionMegaMenuList: readonly TogstrekSectionMegaMenuDefinition[] =
  [togstrekHikingMegaMenu, togstrekOtherWorkMegaMenu];
