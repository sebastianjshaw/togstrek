import type { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";

import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import { TogstrekHomeVisitedMapSection } from "@/components/togstrek-home/togstrek-home-visited-map-section";
import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekRegionGrid } from "@/components/togstrek-region-grid";
import { TogstrekCtaGhostInverseLink } from "@/components/togstrek-ui/togstrek-cta-ghost-inverse-link";
import { TogstrekCtaOutlineAccentLink } from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";
import { togstrekSiteLandingHeroImage } from "@/config/togstrek-media";
import { pickRandomHomeSpotlightAdventure } from "@/lib/togstrek-home-spotlight";
import {
  buildTogstrekMetadata,
  TOGSTREK_OG_IMAGE_HEIGHT,
  TOGSTREK_OG_IMAGE_WIDTH,
  TOGSTREK_SITE_NAME,
} from "@/lib/togstrek-metadata";

const homeHero = togstrekSiteLandingHeroImage();

export const metadata: Metadata = {
  ...buildTogstrekMetadata({
    title: TOGSTREK_SITE_NAME,
    description:
      "The most exciting journey is the next one. Travel photography, place guides, and personal essays — countries, trails, cities, and the stories behind the frame.",
    path: "/",
    openGraphTitle: TOGSTREK_SITE_NAME,
    openGraphDescription:
      "Travel photography and personal essays from the road: regions, places, hikes, and what the camera caught.",
    openGraphImages: [
      {
        url: homeHero.src,
        width: TOGSTREK_OG_IMAGE_WIDTH,
        height: TOGSTREK_OG_IMAGE_HEIGHT,
        alt: homeHero.alt,
      },
    ],
  }),
  title: { absolute: TOGSTREK_SITE_NAME },
};

export default function HomePage() {
  noStore();
  const spotlightAdventure = pickRandomHomeSpotlightAdventure();

  return (
    <div data-pagefind-ignore>
      <TogstrekPageHero
        imageSrc={homeHero.src}
        imageAlt={homeHero.alt}
        eyebrow="Travel · Photography · Photo essays"
        title="The most exciting journey is the next one…"
        titleId="togstrek-home-hero-heading"
        stripTexture
        showAccentRule
        lead={
          <p>
            Curious travel guides and photo essays from real trips. Countries, cities, trails, and the places in between, each one documented with enough detail to be useful and enough honesty to be worth reading.
          </p>
        }
        actions={
          <>
            <TogstrekCtaOutlineAccentLink
              href="/#togstrek-region-grid-heading"
              appearance="solid"
              className="focus-visible:ring-offset-[color-mix(in_srgb,var(--tt-color-ink-strong)_88%,transparent)] sm:min-h-11"
            >
              Explore regions
            </TogstrekCtaOutlineAccentLink>
            <TogstrekCtaGhostInverseLink href="/about" className="sm:min-h-11">
              About the tog
            </TogstrekCtaGhostInverseLink>
          </>
        }
      />
      <TogstrekFeaturedAdventure
        layout="media"
        adventure={spotlightAdventure}
        sectionAriaLabelledBy="togstrek-home-spotlight-heading"
      />
      <TogstrekHomeVisitedMapSection />
      <TogstrekRegionGrid />
    </div>
  );
}
