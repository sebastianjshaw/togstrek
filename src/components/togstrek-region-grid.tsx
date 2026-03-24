import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";

type TogstrekRegionItem = {
  href: string;
  label: string;
  blurb: string;
  gradient: string;
  imageSrc?: string;
  imageAlt?: string;
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
      <TogstrekContentWidth>
        <TogstrekSectionHeader
          id="togstrek-region-grid-heading"
          title="Where to"
          description="Pick a region — each collection is built for wandering slowly, with maps, notes, and images from the road."
          descriptionProminent
        />

        <ul className="mt-[var(--tt-space-12)] grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:gap-8">
          {togstrekRegions.map((region) => {
            const isFeatured = Boolean(region.featured);

            return (
              <li
                key={region.href}
                className={`min-w-0 ${isFeatured ? "md:col-span-2" : ""}`}
              >
                <TogstrekLinkCard
                  variant="region"
                  href={region.href}
                  title={region.label}
                  description={region.blurb}
                  gradient={region.gradient}
                  imageSrc={region.imageSrc}
                  imageAlt={region.imageAlt}
                  featured={region.featured}
                />
              </li>
            );
          })}
        </ul>
      </TogstrekContentWidth>
    </section>
  );
}
