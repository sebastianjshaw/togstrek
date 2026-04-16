import { TogstrekLinkCard } from "@/components/togstrek-ui/togstrek-link-card";
import { TogstrekSectionHeader } from "@/components/togstrek-ui/togstrek-section-header";
import {
  countPlacesInSwedenLan,
  discoverSwedenLanDirectorySlugs,
  listPlaceSlugsForSwedenLan,
  TOGSTREK_SWEDEN_CONTINENT,
  TOGSTREK_SWEDEN_COUNTRY,
} from "@/lib/togstrek-sweden-lan";
import { formatSlugLabel } from "@/lib/togstrek-geo-labels";
import {
  loadTogstrekPlaceFrontmatterOnly,
  togstrekPlaceMdxExists,
} from "@/lib/togstrek-load-place-mdx";

const TOGSTREK_SWEDEN_LAN_CARD_GRADIENTS = [
  "from-[#1a2332] via-[#2d4a3e] to-[#c4a574]/28",
  "from-[#1f2838] via-[#3d4f6b] to-[#c9a86c]/30",
  "from-[#1b2a1e] via-[#2f4a32] to-[#8fbc8f]/22",
  "from-[#2a1a14] via-[#4a2a18] to-[#e35d2d]/28",
  "from-[#1a1420] via-[#2d1f28] to-[#e31937]/28",
  "from-[#0f2d3a] via-[#1e5c6b] to-[#7ec8d3]/25",
] as const;

function lanSlugsForHubCards(): string[] {
  return discoverSwedenLanDirectorySlugs().filter(
    (lan) =>
      !togstrekPlaceMdxExists(
        TOGSTREK_SWEDEN_CONTINENT,
        TOGSTREK_SWEDEN_COUNTRY,
        [lan],
      ),
  );
}

function firstHeroForLan(lanSlug: string): {
  imageSrc?: string;
  imageAlt?: string;
} {
  for (const { place } of listPlaceSlugsForSwedenLan(lanSlug)) {
    const fm = loadTogstrekPlaceFrontmatterOnly(
      TOGSTREK_SWEDEN_CONTINENT,
      TOGSTREK_SWEDEN_COUNTRY,
      place,
    );
    if (fm.heroImage?.src) {
      return { imageSrc: fm.heroImage.src, imageAlt: fm.heroImage.alt };
    }
  }
  return {};
}

/** Län cards linking to `/europe/sweden/{lan}` hubs — optional cover from first place with a hero. */
export function TogstrekSwedenLanStrip() {
  const slugs = lanSlugsForHubCards();

  return (
    <section aria-labelledby="togstrek-sweden-lan-heading">
      <TogstrekSectionHeader
        id="togstrek-sweden-lan-heading"
        title="Counties (län)"
        description="Browse place stories by Swedish county — or scroll for every location in Sweden below."
      />
      <ul className="togstrek-sweden-lan-strip-list mt-[var(--tt-space-10)] grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {slugs.map((slug, i) => {
          const label = formatSlugLabel(slug);
          const n = countPlacesInSwedenLan(slug);
          const gradient =
            TOGSTREK_SWEDEN_LAN_CARD_GRADIENTS[
              i % TOGSTREK_SWEDEN_LAN_CARD_GRADIENTS.length
            ]!;
          const { imageSrc, imageAlt } = firstHeroForLan(slug);
          return (
            <li key={slug} className="min-w-0">
              <TogstrekLinkCard
                variant="region"
                href={`/${TOGSTREK_SWEDEN_CONTINENT}/${TOGSTREK_SWEDEN_COUNTRY}/${slug}`}
                title={label}
                description={
                  n === 1
                    ? "1 place story in this county."
                    : `${n} place stories in this county.`
                }
                gradient={gradient}
                imageSrc={imageSrc}
                imageAlt={imageAlt}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
