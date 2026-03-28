# Tog’s Trek — brand tone of voice

Guidance for site copy, metadata, and MDX. Use this when writing new pages or revisiting migrated content.

## Core voice

- **First person, grounded.** The site is one traveller’s chronicle — curious, direct, and personal without sounding like a brochure.
- **British English** for spelling and phrasing where it matters: *travelling*, *harbour*, *colour* (in prose). Match US spellings only in proper names or quotes.
- **Earnest, not hype.** Prefer concrete place detail over superlatives (“stunning”, “must-see”). Let images carry wonder; text explains what happened and what it felt like to be there.

## Patterns we use

- **Eyebrows:** Short, often uppercase in UI — region or section type (*Europe*, *Latest adventure*, *Hiking*).
- **Titles:** Clear and specific; migration titles can stay as-imported until you rewrite for clarity.
- **Leads and section blurbs:** One or two sentences; say what the page *does* (maps, lists, stories) without repeating the same UN-list sentence in both hero metadata and the “On the map” block — one layer is enough for readers.

## Duplication to avoid

- Repeating **“UN list / 195 / coverage”** in the continent hero description *and* the map section *and* the countries intro. Hero/meta should set the mood; the map and countries sections carry the methodology.
- **Stacking the same philosophical line** in multiple surfaces is fine only when intentional (e.g. About hero + Other Work mega-menu tagline echo). Otherwise vary the angle.

## Factual and editorial notes

- **UN-style list of 195:** In user-facing copy, describe it as **193 UN member states plus the Holy See and Palestine as permanent observers** — not ad hoc country names pulled from data quirks.
- **Place pages:** Hero eyebrow should use human-readable labels (`formatSlugLabel`), not raw URL slugs.
- **Adventures archive:** Tiles may link to stories that are not yet migrated; the section description should stay honest about that.

## Known gaps (fill when you can)

| Area | What’s missing |
|------|----------------|
| Continent hubs (non-Europe) | **Hero pull quotes** were removed as placeholders; only Europe keeps the Eddie Izzard line. Add real attributions when you have them, or leave quotes off. |
| Country hub SEO | Descriptions are generic (“Place stories and photos from …”). Richer, unique lines per country help search and sharing. |
| Migrated MDX | Some **descriptions** may be truncated from legacy meta; spot-check against full article text. |
| Hiking hub MDX | Intro still mentions static-export limits; replace when pagination is final. |
| Other Work hub | `description` in frontmatter should expand beyond repeating the title. |
| Internal links | About page still points at legacy paths (e.g. `/blog/...`, `/contact`) where the Next app may use different routes — audit when those routes exist. |
| `/map-demo` | Dev-style map playground; copy is neutral. Remove from public nav or add `noindex` if it should not be indexed. |
| Copyright band on About | Ending year and “TogsTrek” styling may predate the current footer — align if policy changed. |

## Voice checklist (before publish)

1. One clear promise in the first screen (what you’ll find on this page).
2. No placeholder strings visible to visitors.
3. Apostrophes: **Tog’s Trek** (curly apostrophe in display copy where the design system allows).
4. Sentence case for long titles unless the line is a deliberate headline style.

## Reference snippets

- **Home lead (baseline):** Curious travel guides and photo essays that go deeper — countries, cities, hikes, and the stories behind the frame.
- **Map section (continents):** Shared helper `togstrekHubOnTheMapSectionDescription` in `src/lib/togstrek-hub-section-copy.tsx`.
- **Countries list intro:** Shared `TogstrekHubCountriesListIntro` for consistent UN 195 wording.

---

*Last reviewed with codebase copy pass — update this file when voice or IA changes.*
