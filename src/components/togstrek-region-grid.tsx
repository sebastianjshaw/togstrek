import { TogstrekContentWidth } from "@/components/togstrek-ui/togstrek-content-width";
import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import { togstrekRegionGridItems } from "@/data/togstrek-region-grid";

export function TogstrekRegionGrid() {
  return (
    <section
      className="togstrek-region-grid border-t border-tt-border-muted bg-tt-surface-muted py-[var(--tt-space-20)]"
      aria-labelledby="togstrek-region-grid-heading"
    >
      <TogstrekContentWidth>
        <TogstrekSectionHeader
          id="togstrek-region-grid-heading"
          title="Where to?"
          description="Pick a continent. Each collection is built for wandering slowly, with maps, notes, and images from the road."
          descriptionProminent
        />

        <ul className="mt-[var(--tt-space-12)] grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-7 lg:gap-8">
          {togstrekRegionGridItems.map((region) => {
            const spanFullWidth = Boolean(
              region.featured || region.fullWidth,
            );

            return (
              <li
                key={region.href}
                className={`min-w-0 ${spanFullWidth ? "md:col-span-2" : ""}`}
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
