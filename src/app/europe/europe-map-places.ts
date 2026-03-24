import type { TogstrekMapPlace } from "@/components/togstrek-explore-map";

/** Example pins for the Europe hub — replace with build-time data from your content. */
export const europeMapPlaces: TogstrekMapPlace[] = [
  {
    id: "innsbruck",
    href: "/europe/austria/innsbruck",
    title: "Innsbruck",
    excerpt: "Alpen Zoo, the Golden Roof, and cable cars into the Alps.",
    longitude: 11.4041,
    latitude: 47.2692,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80",
    thumbnailAlt: "Alpine town",
  },
  {
    id: "paris",
    href: "/europe/france/paris",
    title: "Paris",
    excerpt: "Light, stone, and long evenings along the Seine.",
    longitude: 2.3522,
    latitude: 48.8566,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80",
    thumbnailAlt: "Paris",
  },
  {
    id: "oslo",
    href: "/europe/norway/oslo",
    title: "Oslo",
    excerpt: "Fjords and forests within reach of the capital.",
    longitude: 10.7522,
    latitude: 59.9139,
  },
  {
    id: "stockholm",
    href: "/europe/sweden/stockholm",
    title: "Stockholm",
    excerpt: "Archipelago light on granite.",
    longitude: 18.0686,
    latitude: 59.3293,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1509356840521-f934ccebc619?w=800&q=80",
    thumbnailAlt: "Stockholm waterfront",
  },
  {
    id: "rome",
    href: "/europe/italy/rome",
    title: "Rome",
    excerpt: "Layers of empire, baroque fountains, and wrong turns that go right.",
    longitude: 12.4964,
    latitude: 41.9028,
    thumbnailSrc:
      "https://images.unsplash.com/photo-1552832230-01950db26b21?w=800&q=80",
    thumbnailAlt: "Rome",
  },
  {
    id: "kungalv",
    href: "/europe/sweden/kungalv",
    title: "Kungälv",
    excerpt: "Bohus Fortress, medieval stones, and west-coast light.",
    longitude: 12.0761,
    latitude: 57.8708,
  },
];
