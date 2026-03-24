"use client";

import Image from "next/image";
import Link from "next/link";

import {
  togstrekAdventuresMegaFeaturedCards,
  togstrekAdventuresMegaTagline,
} from "@/data/togstrek-adventures-mega-menu";

const CARD_IMAGE_WRAP =
  "togstrek-site-header-adventures-mega-card-image relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] border border-white/15";

type TogstrekSiteHeaderAdventuresMegaPanelProps = {
  onNavigate: () => void;
};

export function TogstrekSiteHeaderAdventuresMegaPanel({
  onNavigate,
}: TogstrekSiteHeaderAdventuresMegaPanelProps) {
  return (
    <div className="togstrek-site-header-adventures-mega-panel mx-auto max-w-[var(--tt-layout-max-wide)] px-tt-gutter py-tt-10 text-tt-text-inverse">
      <h2 className="font-tt-display text-tt-subhero font-extrabold uppercase leading-tt-tight tracking-tt-tight">
        Adventures
      </h2>

      <ul className="mt-tt-8 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6 lg:gap-8">
        {togstrekAdventuresMegaFeaturedCards.map((card) => (
          <li key={card.href} className="min-w-0">
            <Link
              href={card.href}
              onClick={onNavigate}
              className="togstrek-site-header-adventures-mega-card-link group block"
            >
              <div className={CARD_IMAGE_WRAP}>
                <Image
                  src={card.imageSrc}
                  alt={card.imageAlt}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-tt-slow ease-tt-out group-hover:scale-[1.02]"
                />
              </div>
              <p className="mt-tt-4 font-tt-display text-tt-lead font-semibold text-tt-text-inverse">
                {card.title}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-tt-8 flex justify-center md:justify-start">
        <Link
          href="/adventures"
          onClick={onNavigate}
          className="inline-flex min-h-12 items-center justify-center border-tt-thick border-tt-text-inverse bg-transparent px-8 py-3 font-tt-display text-tt-small font-semibold uppercase tracking-tt-wide text-tt-text-inverse transition-colors duration-tt-normal hover:bg-tt-text-inverse hover:text-tt-surface-inverse"
        >
          See All Adventures…
        </Link>
      </div>

      <p className="mt-tt-8 max-w-[52ch] font-tt-body text-tt-small font-bold uppercase leading-tt-snug tracking-tt-wide text-tt-text-inverse/95">
        {togstrekAdventuresMegaTagline}
      </p>
    </div>
  );
}
