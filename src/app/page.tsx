import { TogstrekHomeHero } from "@/components/togstrek-home-hero";
import { TogstrekHomeLatestAdventure } from "@/components/togstrek-home-latest-adventure";
import { TogstrekRegionGrid } from "@/components/togstrek-region-grid";

const TOGSTREK_HERO_IMAGE =
  "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1648486443947-NE59SWBOO1XR2W3MHJ97/IMG_4140.jpg?format=2500w";

export default function HomePage() {
  return (
    <>
      <TogstrekHomeHero
        imageSrc={TOGSTREK_HERO_IMAGE}
        imageAlt="Landscape photograph from Tog's Trek"
      />
      <TogstrekHomeLatestAdventure />
      <TogstrekRegionGrid />
      <footer className="border-t border-tt-border-muted bg-tt-surface-base py-[max(var(--tt-space-12),env(safe-area-inset-bottom))]">
        <div className="mx-auto max-w-[var(--tt-layout-max-content)] min-w-0 px-[var(--tt-layout-gutter)] text-center font-tt-body text-[length:var(--tt-text-small)] text-tt-text-tertiary [overflow-wrap:anywhere]">
          <p>All images © Tog&apos;s Trek unless noted.</p>
        </div>
      </footer>
    </>
  );
}
