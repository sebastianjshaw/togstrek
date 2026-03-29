import type { Metadata } from "next";

import { TogstrekAdventuresPage } from "@/components/togstrek-adventures/togstrek-adventures-page";
import {
  TOGSTREK_ADVENTURES_HERO_IMAGE_FILE,
  togstrekAdventuresImage,
} from "@/data/togstrek-adventures-page";
import {
  buildTogstrekMetadata,
  TOGSTREK_OG_IMAGE_HEIGHT,
  TOGSTREK_OG_IMAGE_WIDTH,
} from "@/lib/togstrek-metadata";

const ADVENTURES_DESCRIPTION =
  "Long-form trips on Tog's Trek — from 443km through Sweden to the ends of the world — with the full stories and photography when each page is live.";

const ogImageUrl = togstrekAdventuresImage(TOGSTREK_ADVENTURES_HERO_IMAGE_FILE);

export const metadata: Metadata = buildTogstrekMetadata({
  title: "Exploration & Adventure",
  description: ADVENTURES_DESCRIPTION,
  path: "/adventures",
  openGraphDescription: ADVENTURES_DESCRIPTION,
  openGraphImages: [
    {
      url: ogImageUrl,
      width: TOGSTREK_OG_IMAGE_WIDTH,
      height: TOGSTREK_OG_IMAGE_HEIGHT,
      alt: "Gentoo penguins standing on dark rocky ground near the shore.",
    },
  ],
});

export default function AdventuresPage() {
  return <TogstrekAdventuresPage />;
}
