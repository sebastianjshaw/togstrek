import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  UK_NATION_CARD_BLURB,
  UK_NATION_CARD_GRADIENT,
  UK_NATION_SLUGS,
  getUkNationLabel,
} from "@/lib/togstrek-uk-nations";

/** Four nation cards for the `/europe/united-kingdom` hub. */
export function TogstrekUkNationsStrip() {
  return (
    <section aria-labelledby="togstrek-uk-nations-heading">
      <TogstrekSectionHeader
        id="togstrek-uk-nations-heading"
        title="England, Scotland, Wales & Northern Ireland"
        description="Browse place stories by nation — or see every location in the United Kingdom below."
      />
      <ul className="togstrek-uk-nations-strip-list mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {UK_NATION_SLUGS.map((slug) => (
          <li key={slug} className="min-w-0">
            <TogstrekLinkCard
              variant="region"
              href={`/europe/united-kingdom/${slug}`}
              title={getUkNationLabel(slug)}
              description={UK_NATION_CARD_BLURB[slug]}
              gradient={UK_NATION_CARD_GRADIENT[slug]}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
