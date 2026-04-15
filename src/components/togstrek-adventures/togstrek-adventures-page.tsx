import { TogstrekPageHero } from "@/components/togstrek-page-hero";
import { TogstrekCtaOutlineAccentExternalLink } from "@/components/togstrek-ui/togstrek-cta-outline-accent-link";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekEditorialMediaCard } from "@/components/togstrek-ui/togstrek-editorial-media-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  TOGSTREK_ADVENTURES_HERO_IMAGE_FILE,
  togstrekAdventuresImage,
} from "@/data/togstrek-adventures-page";
import { listSortedTogstrekAdventureArchiveItems } from "@/lib/togstrek-adventure-content-fs";

export function TogstrekAdventuresPage() {
  const adventureArchive = listSortedTogstrekAdventureArchiveItems();
  const heroSrc = togstrekAdventuresImage(TOGSTREK_ADVENTURES_HERO_IMAGE_FILE);

  return (
    <main className="togstrek-adventures-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      <TogstrekPageHero
        variant="landing"
        imageSrc={heroSrc}
        imageAlt="Gentoo penguins on the shore — exploration and adventure"
        eyebrow="A Tog's Trek"
        title="Exploration & Adventure"
        titleId="togstrek-adventures-hero-title"
      />

      <TogstrekContentWidth className="py-[var(--tt-space-16)]">
        <section
          id="togstrek-adventures-archive-grid"
          className="togstrek-adventures-page-archive border-t border-tt-border-muted pt-[var(--tt-space-16)]"
          aria-labelledby="togstrek-adventures-archive-pitch togstrek-adventures-archive-heading"
        >
          <h2
            id="togstrek-adventures-archive-pitch"
            className="togstrek-adventures-page-archive-pitch mx-auto max-w-[min(40rem,100%)] text-center font-tt-display text-[clamp(1.2rem,3.8vw,2.35rem)] font-extrabold leading-[var(--tt-leading-snug)] text-tt-text-primary"
          >
            Sometimes my travels are{" "}
            <span className="text-tt-accent">bigger</span>
            {" "}
            and deserve more attention. I&apos;ve{" "}
            <span className="text-tt-accent">walked</span>{" "}
            443km of Sweden and been to the ends of the{" "}
            <span className="text-tt-accent">World</span>.
          </h2>
          <div className="mt-[var(--tt-space-10)] flex justify-center">
            <TogstrekCtaOutlineAccentExternalLink
              href="https://www.blurb.com/user/shawsolution"
              target="_blank"
              rel="noopener noreferrer"
              className="togstrek-adventures-page-outline-btn text-center text-[length:var(--tt-text-overline)] font-tt-display leading-snug tracking-[var(--tt-tracking-overline)]"
            >
              Buy the Books
            </TogstrekCtaOutlineAccentExternalLink>
          </div>
          <TogstrekSectionHeader
            id="togstrek-adventures-archive-heading"
            className="mt-[var(--tt-space-20)]"
            title="All adventure stories"
            description="Every long-form trip on the original site, in chronological order — open a tile for the full story."
          />
          <ul className="togstrek-adventures-page-archive-grid mt-[var(--tt-space-12)] grid grid-cols-1 gap-[var(--tt-space-10)] sm:grid-cols-2 sm:gap-x-8 sm:gap-y-12 lg:grid-cols-3">
            {adventureArchive.map((item) => (
              <li key={item.href} className="min-w-0">
                <TogstrekEditorialMediaCard
                  href={item.href}
                  imageSrc={item.imageSrc}
                  imageAlt={item.imageAlt}
                  overline="Adventure"
                  title={item.title}
                  microCtaLabel="Open the story"
                />
              </li>
            ))}
          </ul>
        </section>
      </TogstrekContentWidth>
    </main>
  );
}
