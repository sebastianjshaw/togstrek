import Image from "next/image";
import Link from "next/link";

type TogstrekRegionItem = {
  href: string;
  label: string;
  blurb: string;
  gradient: string;
  /** Local or remote image — when set, fills the card behind text. */
  imageSrc?: string;
  imageAlt?: string;
  /** Wide cinematic card on large screens (e.g. Europe). */
  featured?: boolean;
};

const togstrekRegions: TogstrekRegionItem[] = [
  {
    href: "/adventures",
    label: "Adventures",
    blurb: "Longer trips & focused stories",
    gradient: "from-[#1a1420] via-[#2d1f28] to-[#e31937]/40",
  },
  {
    href: "/africa",
    label: "Africa",
    blurb: "Deserts, cities, wildlife",
    gradient: "from-[#3d2914] via-[#6b3a1a] to-[#1a1420]",
  },
  {
    href: "/antarctica",
    label: "Antarctica",
    blurb: "Ice, silence, scale",
    gradient: "from-[#0c1829] via-[#1e3a5f] to-[#7cb8d8]/35",
  },
  {
    href: "/asia",
    label: "Asia",
    blurb: "Temples to skylines",
    gradient: "from-[#1a1420] via-[#4a1538] to-[#e31937]/35",
  },
  {
    href: "/europe",
    label: "Europe",
    blurb: "History in every alley — Alps to alleyways.",
    gradient: "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30",
    imageSrc: "/regions/europe.png",
    imageAlt:
      "Sunlit alpine ridge with green slopes, rocky peaks, and sheep under a blue sky",
    featured: true,
  },
  {
    href: "/north-america",
    label: "North America",
    blurb: "Coast to range",
    gradient: "from-[#1a2332] via-[#2d4a3e] to-[#c4a574]/25",
  },
  {
    href: "/oceania",
    label: "Oceania",
    blurb: "Islands & horizons",
    gradient: "from-[#0f2d3a] via-[#1e5c6b] to-[#7ec8d3]/30",
  },
  {
    href: "/south-america",
    label: "South America",
    blurb: "Andes to jungle",
    gradient: "from-[#2a1a14] via-[#4a2a18] to-[#e35d2d]/35",
  },
  {
    href: "/hiking",
    label: "Hiking",
    blurb: "Trails & treks",
    gradient: "from-[#1b2a1e] via-[#2f4a32] to-[#8fbc8f]/25",
  },
  {
    href: "/other-work",
    label: "Other Work",
    blurb: "Beyond travel",
    gradient: "from-[#1a1420] via-[#2a2230] to-[#8880a0]/35",
  },
];

export function TogstrekRegionGrid() {
  return (
    <section
      className="togstrek-region-grid border-t border-tt-border-muted bg-tt-surface-muted py-[var(--tt-space-20)]"
      aria-labelledby="togstrek-region-grid-heading"
    >
      <div className="mx-auto max-w-[var(--tt-layout-max-wide)] px-[var(--tt-layout-gutter)]">
        <h2
          id="togstrek-region-grid-heading"
          className="font-tt-display text-[length:var(--tt-text-display)] font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-primary"
        >
          Where to
        </h2>
        <p className="mt-[var(--tt-space-4)] max-w-[var(--tt-layout-max-prose)] font-tt-body text-[length:var(--tt-text-lead)] text-tt-text-secondary">
          Pick a region — each collection is built for wandering slowly, with
          maps, notes, and images from the road.
        </p>

        <ul className="mt-[var(--tt-space-12)] grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:gap-8">
          {togstrekRegions.map((region) => {
            const isFeatured = Boolean(region.featured);
            const hasImage = Boolean(region.imageSrc);

            return (
              <li
                key={region.href}
                className={`min-w-0 ${isFeatured ? "md:col-span-2" : ""}`}
              >
                <Link
                  href={region.href}
                  className={`togstrek-region-card group relative flex min-h-[var(--tt-region-card-min-height)] flex-col justify-end overflow-hidden border border-tt-border-muted bg-tt-surface-base shadow-[var(--tt-shadow-sm)] transition-[transform,box-shadow,border-color] duration-[var(--tt-duration-normal)] ease-[var(--tt-ease-out)] after:pointer-events-none after:absolute after:inset-0 after:border-[length:var(--tt-border-width-thick)] after:border-transparent after:transition-colors hover:-translate-y-1 hover:shadow-[var(--tt-shadow-elevated)] hover:after:border-tt-accent ${
                    isFeatured
                      ? "lg:min-h-[var(--tt-region-card-featured-min-height)]"
                      : ""
                  }`}
                >
                  {hasImage && region.imageSrc ? (
                    <>
                      <Image
                        src={region.imageSrc}
                        alt={region.imageAlt ?? ""}
                        fill
                        className="object-cover object-center transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-[1.04]"
                        sizes={
                          isFeatured
                            ? "(max-width:768px) 100vw, min(90rem, 100vw)"
                            : "(max-width:768px) 100vw, 50vw"
                        }
                      />
                      <div
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[color-mix(in_srgb,var(--tt-color-ink-strong)_88%,transparent)] via-[color-mix(in_srgb,var(--tt-color-ink-strong)_35%,transparent)] to-[color-mix(in_srgb,var(--tt-color-ink-strong)_12%,transparent)]"
                        aria-hidden
                      />
                    </>
                  ) : (
                    <div
                      className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${region.gradient} opacity-95 transition-transform duration-[var(--tt-duration-slow)] ease-[var(--tt-ease-out)] group-hover:scale-105`}
                      aria-hidden
                    />
                  )}

                  <div
                    className={`relative z-[1] p-6 sm:p-8 ${
                      isFeatured ? "sm:p-10" : ""
                    }`}
                  >
                    <span
                      className={`font-tt-display font-bold uppercase tracking-[var(--tt-tracking-wide)] text-tt-text-inverse ${
                        isFeatured
                          ? "text-[clamp(1.65rem,4.5vw,3.25rem)] leading-[var(--tt-leading-tight)]"
                          : "text-[length:var(--tt-text-title)]"
                      }`}
                    >
                      {region.label}
                    </span>
                    <p
                      className={`mt-3 max-w-[min(40ch,100%)] font-tt-body text-tt-text-inverse/90 [overflow-wrap:anywhere] ${
                        isFeatured
                          ? "text-[length:var(--tt-text-lead)] leading-[var(--tt-leading-relaxed)]"
                          : "text-[length:var(--tt-text-small)]"
                      }`}
                    >
                      {region.blurb}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
