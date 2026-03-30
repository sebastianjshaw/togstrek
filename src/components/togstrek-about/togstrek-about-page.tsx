import Image from "next/image";

import { TogstrekBodyLink } from "@/components/togstrek-ui/togstrek-body-link";
import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";

const COLLAGE_ACTIVITY_SRC =
  "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1644681006276-W57LTKTXP2Y4U9PWCUNF/61834b2d19d33df7.jpg";

const COLLAGE_TRAVEL_SRC =
  "https://images.squarespace-cdn.com/content/v1/6207d70ece223e42dd9ae587/1644681006298-Y0IPEL27K6K669FGFMRS/49e1ab56da5755d9.jpg";

export function TogstrekAboutPage() {
  return (
    <main className="togstrek-about-page w-full min-w-0 flex-1 [overflow-wrap:anywhere]">
      {/* Custom dark hero (radial accents) — not `TogstrekPageHero`; mirrors eyebrow / rule / `TogstrekContentWidth` patterns there. */}
      <section
        className="togstrek-about-hero relative isolate overflow-hidden border-b border-tt-border-on-inverse bg-tt-surface-inverse text-tt-text-inverse"
        aria-labelledby="togstrek-about-hero-heading"
      >
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_-15%,color-mix(in_srgb,var(--tt-color-accent)_22%,transparent),transparent_58%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_100%_30%,color-mix(in_srgb,var(--tt-color-text-inverse)_7%,transparent),transparent_52%)]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_50%,transparent)] to-transparent"
          aria-hidden
        />

        <TogstrekContentWidth className="relative py-[clamp(3.5rem,14vw,9rem)]">
          <p className="font-tt-display text-[length:var(--tt-text-overline)] font-semibold uppercase tracking-[var(--tt-tracking-overline)] text-tt-accent">
            About
          </p>

          <h1
            id="togstrek-about-hero-heading"
            className="mt-[var(--tt-space-8)] font-tt-display font-extrabold leading-[0.92] tracking-[var(--tt-tracking-tight)] [text-wrap:balance]"
          >
            <span className="block text-[clamp(2.4rem,7.5vw,5.75rem)] text-tt-text-inverse">
              Exploration is not{" "}
              <span className="text-tt-text-inverse/88">just travelling.</span>
            </span>
            <span className="togstrek-about-hero-subline mt-[0.45em] block max-w-[min(38rem,100%)] text-[clamp(1.2rem,3.2vw,2.35rem)] font-semibold leading-[1.18] text-tt-text-inverse/92">
              It’s how you look at the world, how you try new things, and how
              you learn.
            </span>
          </h1>

          <div
            className="togstrek-about-hero-rule mt-[var(--tt-space-12)] h-px max-w-[8rem] bg-gradient-to-r from-tt-accent to-transparent"
            aria-hidden
          />

          <p className="mt-[var(--tt-space-8)] max-w-[42ch] font-tt-body text-[length:var(--tt-text-small)] font-medium uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse/90">
            Sebastian Shaw — Gothenburg · travel &amp; photography
          </p>
        </TogstrekContentWidth>
      </section>

      <section
        className="togstrek-about-who-band border-b border-tt-border-muted bg-tt-surface-base py-[var(--tt-space-16)] md:py-[var(--tt-space-20)]"
        aria-labelledby="togstrek-about-who-heading"
      >
        <TogstrekContentWidth>
          <h2
            id="togstrek-about-who-heading"
            className="font-tt-display text-[length:var(--tt-text-display)] font-bold tracking-[var(--tt-tracking-tight)] text-tt-text-primary"
          >
            Who am I?
          </h2>
          <p className="mt-[var(--tt-space-6)] font-tt-display text-[length:var(--tt-text-title)] font-semibold text-tt-text-primary">
            I grew up travelling.
          </p>
          <p className="mt-[var(--tt-space-4)] max-w-[52ch] font-tt-body text-[length:var(--tt-text-lead)] font-semibold leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            By the time I was 18, I&apos;d lived in the UK, the USA, Singapore,
            the Netherlands and Nigeria. I&apos;ve never stopped moving and by the
            end of 2025, I&apos;d visited 74 countries and special territories at least once.
          </p>
          <p className="mt-[var(--tt-space-6)] max-w-[52ch] font-tt-body text-[length:var(--tt-text-lead)] font-semibold leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
            I&apos;ve been asked,{" "}
            <em>&quot;Do you ever just go to a beach and just lay there?&quot;</em>{" "}
            and the answer is never, I relax by seeing something new.
          </p>
        </TogstrekContentWidth>
      </section>

      <section className="togstrek-about-story-band bg-[color-mix(in_srgb,var(--tt-color-surface-tint)_55%,var(--tt-color-white))] py-[var(--tt-space-14)] md:py-[var(--tt-space-20)]">
        <TogstrekContentWidth>
          <div className="togstrek-about-gallery grid grid-cols-1 gap-[var(--tt-space-3)] md:grid-cols-12 md:gap-[var(--tt-space-4)] md:items-end">
            <div className="togstrek-about-gallery-primary md:col-span-7">
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-[0_32px_80px_-28px_rgba(0,0,0,0.55)] md:aspect-[5/6] md:max-h-[min(78vh,720px)] md:min-h-[min(70vh,600px)]">
                <Image
                  src={COLLAGE_ACTIVITY_SRC}
                  alt="Collage of outdoor activities: a person with a hiking stick on a hilltop, a person in winter gear on a snowy slope, a photographer capturing a mountain landscape, and a person standing in a valley with cliffs."
                  fill
                  sizes="(max-width: 768px) 100vw, 58vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            <div className="togstrek-about-gallery-secondary md:col-span-5 md:pb-[var(--tt-space-10)]">
              <div className="relative aspect-[4/5] w-full overflow-hidden shadow-[0_28px_70px_-24px_rgba(0,0,0,0.5)] md:aspect-square">
                <Image
                  src={COLLAGE_TRAVEL_SRC}
                  alt="Seb Shaw in Crete, Jordan, France snowboarding and underwater."
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-[var(--tt-space-14)] max-w-[var(--tt-layout-max-prose)] border-t border-tt-border-muted pt-[var(--tt-space-12)]">
            <p className="font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
              I bought an early digital camera in 1999 from savings earned
              working with my father. It was a tiny thing that ran on AA
              batteries and could take perhaps a hundred 640×480 images. I loved
              it, and it was an early example of where photography was moving
              to, but it was still a toy.
            </p>
            <p className="mt-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
              It was almost another ten years before I first got seriously into
              photography, in 2008. Fresh out of a relationship, I took a dSLR on
              holiday with me that I&apos;d borrowed from a friend and fell in
              love with the art of travel. (You can even read the realisation
              here:{" "}
              <TogstrekBodyLink href="/europe/turkiye/istanbul">
                Galata Tower
              </TogstrekBodyLink>
              ) Previously, I&apos;d been living with a talented amateur
              photographer and had not really taken a hand in shooting, except
              for the occasional snap. Ever since I visited Istanbul, I&apos;ve
              been taking photos of everywhere I have been. I&apos;ve always been
              a prolific writer, and the photos I&apos;ve taken have given me the
              power to illustrate the places I&apos;d been writing about.
            </p>
            <p className="mt-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
              A year or two later, I started turning the bigger trips into
              published travel diaries, a reminder for myself more than anything
              and looking back the narrative is taking more and more space. These
              books evolved into this website, a chronicle of where I have been
              and what I&apos;ve experienced. This is also why some of the
              entries are written chronologically or as a narrative, and others
              are more descriptive of a location and in the style of a travel
              site.
            </p>
            <p className="mt-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
              The name <em>&quot;a Tog&apos;s Trek&quot;</em> comes from the
              shorthand a number of my photography friends use for a group of
              photographers, a group of <em>&quot;Togs&quot;</em>. As a Tog, I
              wanted a record of where I had trekked.
            </p>
            <p className="mt-[var(--tt-space-6)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
              Happy travels,
            </p>
            <p className="mt-[var(--tt-space-4)] font-tt-body text-[length:var(--tt-text-body)] leading-[var(--tt-leading-relaxed)] text-tt-text-secondary">
              <TogstrekBodyLink href="/contact">Contact me</TogstrekBodyLink>{" "}
              for more info — or read{" "}
              <TogstrekBodyLink href="/copyright">
                Usage & copyright
              </TogstrekBodyLink>{" "}
              if you want to quote a photograph.
            </p>
          </div>
        </TogstrekContentWidth>
      </section>
    </main>
  );
}
