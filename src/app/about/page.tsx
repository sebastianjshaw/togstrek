import type { Metadata } from "next";

import { TogstrekAboutPage } from "@/components/togstrek-about/togstrek-about-page";
import { TogstrekJsonLd } from "@/components/togstrek-seo/togstrek-json-ld";
import { togstrekSiteLandingHeroImage } from "@/config/togstrek-media";
import {
  TOGSTREK_ABOUT_PAGE_DESCRIPTION,
  togstrekAboutPageJsonLd,
} from "@/lib/togstrek-json-ld";
import {
  buildTogstrekMetadata,
  TOGSTREK_OG_IMAGE_HEIGHT,
  TOGSTREK_OG_IMAGE_WIDTH,
} from "@/lib/togstrek-metadata";

const aboutOgHero = togstrekSiteLandingHeroImage();

export const metadata: Metadata = buildTogstrekMetadata({
  title: "About",
  description: TOGSTREK_ABOUT_PAGE_DESCRIPTION,
  path: "/about",
  openGraphDescription: TOGSTREK_ABOUT_PAGE_DESCRIPTION,
  openGraphImages: [
    {
      url: aboutOgHero.src,
      width: TOGSTREK_OG_IMAGE_WIDTH,
      height: TOGSTREK_OG_IMAGE_HEIGHT,
      alt: aboutOgHero.alt,
    },
  ],
});

export default function AboutRoutePage() {
  return (
    <>
      <TogstrekJsonLd data={togstrekAboutPageJsonLd()} />
      <TogstrekAboutPage />
    </>
  );
}
