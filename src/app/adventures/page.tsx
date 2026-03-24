import type { Metadata } from "next";

import { TogstrekAdventuresPage } from "@/components/togstrek-adventures/togstrek-adventures-page";
import {
  TOGSTREK_ADVENTURES_HERO_IMAGE_FILE,
  togstrekAdventuresImage,
} from "@/data/togstrek-adventures-page";
import { buildTogstrekMetadata } from "@/lib/togstrek-metadata";

const ADVENTURES_DESCRIPTION =
  "Explore the thrilling adventures of a seasoned traveler on Tog's Trek. From walking 443km of Sweden to reaching the ends of the world, discover captivating stories and stunning photography from across the globe.";

const ogImageUrl = togstrekAdventuresImage(TOGSTREK_ADVENTURES_HERO_IMAGE_FILE);

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Exploration & Adventure",
  description: ADVENTURES_DESCRIPTION,
  path: "/adventures",
  openGraphTitle: "Exploration & Adventure — A Tog's Trek",
  openGraphDescription: ADVENTURES_DESCRIPTION,
  openGraphImages: [
    {
      url: ogImageUrl,
      width: 1500,
      height: 1000,
      alt: "Gentoo penguins — A Tog's Trek",
    },
  ],
});

export default function AdventuresPage() {
  return <TogstrekAdventuresPage />;
}
