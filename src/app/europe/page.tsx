import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import {
  togstrekCountryHubPathByIso2,
  togstrekEuropeSpecialTerritories,
} from "@/data/togstrek-country-hub-paths";
import { togstrekUn195Countries } from "@/data/togstrek-un195-countries";

import { TogstrekHubHeroQuote } from "@/components/togstrek-hub-hero-quote";

import { EuropeMapSection } from "./europe-map-section";

const EUROPE_HERO_IMAGE =
  "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1676558893598-X9ZAV37ZVOCFSNYWMUSF/22e59112fefb45ea.jpg?format=2500w";

const europeUn195Countries = togstrekUn195Countries
  .filter((c) => c.continent === "europe")
  .sort((a, b) => a.name.localeCompare(b.name));

const europeCountryHubCount = europeUn195Countries.filter(
  (c) => togstrekCountryHubPathByIso2[c.iso2],
).length;

export const metadata: Metadata = {
  title: "Exploring Europe",
  description:
    "The 50 countries who host both the largest and smallest nations in the world — photo essays and travel notes from across Europe.",
  openGraph: {
    title: "Exploring Europe — A Tog's Trek",
    description:
      "From Alpine ridges to Baltic towns — stories and images from Tog's Trek across Europe.",
    type: "website",
    images: [
      {
        url: "https://static1.squarespace.com/static/6207d70ece223e42dd9ae587/t/62430201c259e80324888871/1648558593135/IMG_4140.jpg?format=1500w",
        width: 1500,
        height: 1000,
        alt: "Tog's Trek",
      },
    ],
  },
};

export default function EuropeLandingPage() {
  return (
    <main className="togstrek-europe-landing w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {/* Hero — source: Squarespace Europe hub (Alpine adventure feature image) */}
      <section
        className="togstrek-europe-landing-hero relative overflow-hidden border-b border-tt-border-muted"
        aria-labelledby="togstrek-europe-landing-title"
      >
        <div className="relative aspect-[21/9] min-h-[min(56vh,32rem)] w-full sm:min-h-[min(44vh,24rem)] md:aspect-[2.4/1] md:min-h-[min(52vh,28rem)]">
          <Image
            src={EUROPE_HERO_IMAGE}
            alt="Mountain landscape with snow-capped peaks, rocky terrain, and blue sky, intersected by cables."
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_88%,transparent)] via-[color-mix(in_srgb,var(--tt-color-ink-strong)_35%,transparent)] to-[color-mix(in_srgb,var(--tt-color-ink-strong)_18%,transparent)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_50%,rgba(0,0,0,0.42)_0%,transparent_68%)]"
            aria-hidden
          />
          <div className="togstrek-europe-landing-hero-quote-wrap pointer-events-none absolute left-1/2 top-1/2 z-[1] w-full max-w-[var(--tt-layout-max-wide)] -translate-x-1/2 -translate-y-1/2 px-[var(--tt-layout-gutter)]">
            <TogstrekHubHeroQuote attribution="Eddie Izzard">
              I grew up in{" "}
              <span className="text-tt-accent">Europe</span>, where the history
              comes from.
            </TogstrekHubHeroQuote>
          </div>
          <div className="absolute inset-x-0 bottom-0 z-[2] mx-auto max-w-[var(--tt-layout-max-wide)] px-[var(--tt-layout-gutter)] pb-[max(var(--tt-space-10),env(safe-area-inset-bottom))] pt-[var(--tt-space-16)] [text-shadow:0_2px_20px_rgba(0,0,0,0.55)]">
            <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-text-inverse/90">
              Europe
            </p>
            <h1
              id="togstrek-europe-landing-title"
              className="mt-[var(--tt-space-3)] max-w-[20ch] font-tt-display text-[clamp(2rem,5vw,3.5rem)] font-extrabold leading-[var(--tt-leading-tight)] tracking-[var(--tt-tracking-tight)] text-tt-text-inverse"
            >
              Exploring Europe
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[var(--tt-layout-max-wide)] px-[var(--tt-layout-gutter)] py-[var(--tt-space-16)]">
        {/* Featured adventure — source: mega-menu / Europe block */}
        <section
          className="togstrek-europe-landing-featured border border-tt-border-muted bg-tt-surface-muted p-6 sm:p-8"
          aria-labelledby="togstrek-europe-adventure-heading"
        >
          <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent">
            Featured adventure
          </p>
          <h2
            id="togstrek-europe-adventure-heading"
            className="mt-[var(--tt-space-3)] font-tt-display text-[length:var(--tt-text-title)] font-bold text-tt-text-primary"
          >
            2018: Alpine Adventure
          </h2>
          <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-secondary">
            The 50 countries who host both the largest and smallest nations in
            the world.
          </p>
          <p className="mt-[var(--tt-space-6)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            Europe is a continent steeped in history, culture, and diverse
            landscapes. On Tog&apos;s Trek we wander cobblestone streets and
            mountain passes alike — from scenic fjords and Baltic harbours to the
            buzz of capital cities — with a camera and a notebook.
          </p>
          <Link
            href="/adventures/2018-alpine-adventure"
            className="mt-[var(--tt-space-8)] inline-flex min-h-12 w-full min-w-0 items-center justify-center border-[length:var(--tt-border-width-thick)] border-tt-accent bg-transparent px-6 py-3 font-tt-display text-[var(--tt-text-small)] font-semibold uppercase tracking-[var(--tt-tracking-wide)] text-tt-accent transition-colors duration-[var(--tt-duration-normal)] hover:bg-tt-accent hover:text-tt-text-inverse sm:w-auto sm:px-8"
          >
            Open Alpine Adventure
          </Link>
        </section>

        {/* Explore map */}
        <section
          className="togstrek-europe-landing-map"
          aria-labelledby="togstrek-europe-map-heading"
        >
          <h2
            id="togstrek-europe-map-heading"
            className="font-tt-display text-[length:var(--tt-text-display)] font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary"
          >
            On the map
          </h2>
          <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-text-secondary">
            Explore where stories are pinned — zoom clusters, then open a place
            for the full photo essay. (Data here is sample content for the new
            site; your migration will drive this from Markdown.)
          </p>
          <div className="mt-[var(--tt-space-10)]">
            <EuropeMapSection />
          </div>
        </section>

        {/* Special territories — hub pages outside the UN member-state rows */}
        <section
          className="togstrek-europe-landing-special-territories mt-[var(--tt-space-20)]"
          aria-labelledby="togstrek-europe-special-territories-heading"
        >
          <h2
            id="togstrek-europe-special-territories-heading"
            className="font-tt-display text-[length:var(--tt-text-display)] font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary"
          >
            Special territories
          </h2>
          <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-text-secondary">
            Places with their own story collections — not counted as separate
            countries on the UN list.
          </p>
          <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {togstrekEuropeSpecialTerritories.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="togstrek-europe-landing-special-territory-link flex min-h-12 flex-col justify-center border border-tt-border-muted bg-tt-surface-base px-4 py-3 font-tt-body text-[length:var(--tt-text-small)] text-tt-text-secondary transition-colors hover:border-tt-accent hover:text-tt-accent"
                >
                  <span className="font-semibold text-tt-text-primary">
                    {t.label}
                  </span>
                  <span className="mt-1 text-[length:var(--tt-text-overline)] leading-snug text-tt-text-tertiary">
                    {t.note}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* UN-style sovereign states in Europe (subset of 195 worldwide) */}
        <section
          className="togstrek-europe-landing-countries mt-[var(--tt-space-20)]"
          aria-labelledby="togstrek-europe-countries-heading"
        >
          <h2
            id="togstrek-europe-countries-heading"
            className="font-tt-display text-[length:var(--tt-text-display)] font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary"
          >
            Countries
          </h2>
          <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-tt-text-secondary">
            All sovereign states in Europe on the UN-style list of 195 (member
            states, observers, and Guinea-Bissau).{" "}
            <span className="text-tt-text-primary">
              {europeCountryHubCount} of {europeUn195Countries.length}
            </span>{" "}
            have a hub page so far; others stay on the list for coverage at a
            glance.
          </p>
          <ul className="mt-[var(--tt-space-10)] grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {europeUn195Countries.map((c) => {
              const href = togstrekCountryHubPathByIso2[c.iso2];
              const itemClass =
                "togstrek-europe-landing-country-item flex min-h-12 items-center border px-4 py-3 font-tt-body text-[length:var(--tt-text-small)]";
              if (href) {
                return (
                  <li key={c.iso2}>
                    <Link
                      href={href}
                      className={`${itemClass} togstrek-europe-landing-country-item--linked border-tt-border-muted bg-tt-surface-base text-tt-text-secondary transition-colors hover:border-tt-accent hover:text-tt-accent`}
                    >
                      {c.name}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={c.iso2}>
                  <span
                    className={`${itemClass} togstrek-europe-landing-country-item--no-page border-tt-border-muted/60 bg-tt-surface-muted/80 text-tt-text-tertiary`}
                    title="No hub page yet"
                  >
                    {c.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </main>
  );
}
