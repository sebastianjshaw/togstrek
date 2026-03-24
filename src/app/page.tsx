import { TogstrekFeaturedAdventure } from "@/components/togstrek-featured-adventure/togstrek-featured-adventure";
import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekRegionGrid } from "@/components/togstrek-region-grid";
import { TogstrekCtaGhostInverseLink } from "@/components/togstrek-ui/togstrek-cta-ghost-inverse-link";
import { TogstrekCtaOutlineAccentLink } from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";

const TOGSTREK_HERO_IMAGE =
  "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1648486443947-NE59SWBOO1XR2W3MHJ97/IMG_4140.jpg?format=2500w";

export default function HomePage() {
  return (
    <>
      <TogstrekPageHero
        imageSrc={TOGSTREK_HERO_IMAGE}
        imageAlt="Landscape photograph from Tog's Trek"
        eyebrow="Travel · Photography · Photo essays"
        title="The most exciting journey is the next one…"
        titleId="togstrek-home-hero-heading"
        stripTexture
        showAccentRule
        lead={
          <p>
            Curious travel guides and photo essays that go deeper — countries,
            cities, hikes, and the stories behind the frame.
          </p>
        }
        actions={
          <>
            <TogstrekCtaOutlineAccentLink href="/europe" className="sm:min-h-11">
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
        sectionAriaLabelledBy="togstrek-home-latest-adventure-heading"
      />
      <TogstrekRegionGrid />
    </>
  );
}
