"use client";

import { TogstrekCdnImage } from "@/components/togstrek-ui/togstrek-cdn-image";
import Link from "next/link";

import type { TogstrekAdventuresMegaFeaturedCard } from "@/data/togstrek-adventures-mega-menu";

const CARD_IMAGE_WRAP =
  "togstrek-site-header-adventures-mega-card-image relative aspect-[4/3] w-full overflow-hidden rounded-[var(--tt-radius-photo)] border border-white/15";

type TogstrekSiteHeaderAdventuresMegaPanelProps = {
  onNavigate: () => void;
  featuredCards: TogstrekAdventuresMegaFeaturedCard[];
  tagline: string;
};

export function TogstrekSiteHeaderAdventuresMegaPanel({
  onNavigate,
  featuredCards,
  tagline,
}: TogstrekSiteHeaderAdventuresMegaPanelProps) {
  return (
    <div className="togstrek-site-header-adventures-mega-panel mx-auto max-w-[var(--tt-layout-max-wide)] px-[var(--tt-layout-gutter)] py-[var(--tt-space-10)] text-tt-text-inverse">
      <h2 className="font-tt-display text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold uppercase leading-[var(--tt-leading-tight)] tracking-[var(--tt-tracking-tight)]">
        Adventures
      </h2>

      <ul className="mt-[var(--tt-space-8)] grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
        {featuredCards.map((card) => (
          <li key={card.href} className="min-w-0">
            <Link
              href={card.href}
              onClick={onNavigate}
              className="togstrek-site-header-adventures-mega-card-link group block"
            >
              <div className={CARD_IMAGE_WRAP}>
                <TogstrekCdnImage
                  src={card.imageSrc}
                  alt={card.imageAlt}
                  fill
                  slot="megaCard"
                  className="object-cover transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-[var(--tt-space-4)] font-tt-display text-[length:var(--tt-text-lead)] font-semibold text-tt-text-inverse">
                {card.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-[var(--tt-space-8)] flex justify-center md:justify-start">
        <Link
          href="/adventures"
          onClick={onNavigate}
          className="inline-flex min-h-12 items-center justify-center border-[length:var(--tt-border-width-thick)] border-tt-text-inverse bg-transparent px-8 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse transition-colors duration-[var(--tt-duration-normal)] hover:bg-tt-text-inverse hover:text-tt-surface-inverse"
        >
          See All Adventures…
        </Link>
      </div>

      <p className="mt-[var(--tt-space-8)] max-w-[52ch] font-tt-body text-[length:var(--tt-text-small)] font-bold uppercase leading-snug tracking-[var(--tt-tracking-wide)] text-tt-text-inverse/95">
        {tagline}
      </p>
    </div>
  );
}
