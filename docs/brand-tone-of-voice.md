# Tog’s Trek — brand tone of voice

Guidance for site copy, metadata, and MDX. Use this when writing new pages or revisiting migrated content.

## Core voice

- **First person, grounded.** The site is one traveller’s chronicle — curious, direct, and personal without sounding like a brochure.
- **British English** for spelling and phrasing where it matters: *travelling*, *harbour*, *colour* (in prose). Match US spellings only in proper names or quotes.
- **Earnest, not hype.** Prefer concrete place detail over superlatives (“stunning”, “must-see”). Let images carry wonder; text explains what happened and what it felt like to be there.

## How to open a place page

The opening sets the expectation for everything that follows. There are two valid approaches depending on what the page is:

**Drop into the scene** — works when the story is the point and the reader arrives knowing roughly where they are. Jump straight to the moment; geography comes out naturally.

> *”We walked along the waterside promenade for a while, which is both sand and stones depending on the area. Private sections offer the nicer sands based on the willingness of the beach-goer to pay.”* — Nice

**Orient first, then narrate** — works for destinations where historical or geographic context earns its place before the story begins.

> *”Nicknamed ‘the end of the world’ for its location at the southern tip of Argentina on the Beagle Channel; Ushuaia is a resort town whose port offers a gateway to Antarctica as well as to those rounding Cape Horn.”* — Ushuaia

Either way, **avoid restating the page title as the first sentence.** If the page is titled “Kathmandu”, don’t open with “Kathmandu is the capital of Nepal.” The reader already clicked the link.

## How to write a frontmatter description

The `description` field appears in search results, social cards, and hub page tiles. It should work as a standalone sentence — not the article’s opening line.

**Bad (article opener as description):**
> *”The next morning, we got up early to check-out and collected the car.”*

**Good (standalone description):**
> *”A brief stop on the way to Monaco — the promenade, the hill park, and why I will never wear heavy jeans in a Mediterranean summer again.”*

Rules:
- One or two sentences maximum.
- Say what distinguishes this place or trip — not just that a visit happened.
- No placeholder text (“Place stories and photos from…”).
- Write it last, after you know what the page actually covers.

## How to structure a longer place page

**Ushuaia is the benchmark.** It uses navigable sections (Sights, Museums, Parks, Restaurants, Activities) with personal asides woven in rather than bolted on. Each section heading is a real category a reader would scan for; each entry has at least one concrete detail beyond the name.

The pattern:
1. **Opening** — orient or drop into scene (see above).
2. **Jump-to list** — only include if the page is long enough to need one (roughly 800+ words or 5+ sections).
3. **Sections** — use consistent headings across pages of the same type. For place pages: Sights & Culture → Museums & Galleries → Parks & Gardens → Restaurants & Bars → Sports & Activities.
4. **POI entries** — name, one to three sentences, personal detail if you have it. “A lovely library on the main road” is not enough; add what made it worth the detour, or cut the entry.

**Avoid** entries that exist only because something was visited. If there’s nothing worth saying beyond the name, the entry shouldn’t be there.

## Photo captions

Captions show the camera settings used to achieve the shot — make, model, focal length, aperture, shutter speed, ISO. This is a deliberate feature: readers can see exactly how each image was made.

> `Canon EOS R5 EF24-105mm f/4L IS USM, 32mm, f8, 1/1250, ISO100`

Where a caption also needs a descriptive label (location, subject), put the label on a separate line above or use the image `alt` field for the description. The EXIF line stands on its own.

## Patterns we use

- **Eyebrows:** Short, often uppercase in UI — region or section type (*Europe*, *Latest adventure*, *Hiking*).
- **Titles:** Clear and specific; migration titles can stay as-imported until you rewrite for clarity.
- **Leads and section blurbs:** One or two sentences; say what the page *does* (maps, lists, stories) without repeating the same UN-list sentence in both hero metadata and the “On the map” block — one layer is enough for readers.

## Duplication to avoid

- Repeating **”UN list / 195 / coverage”** in the continent hero description *and* the map section *and* the countries intro. Hero/meta should set the mood; the map and countries sections carry the methodology.
- **Stacking the same philosophical line** in multiple surfaces is fine only when intentional (e.g. About hero + Other Work mega-menu tagline echo). Otherwise vary the angle.

## Factual and editorial notes

- **UN-style list of 195:** In user-facing copy, describe it as **193 UN member states plus the Holy See and Palestine as permanent observers** — not ad hoc country names pulled from data quirks.
- **Place pages:** Hero eyebrow should use human-readable labels (`formatSlugLabel`), not raw URL slugs.
- **Visited map / stats:** Use **Places Visited** (and *place* / *places* in map copy), not “cities visited”, so Antarctic and non-city stories read correctly.
- **Adventures archive:** Tiles may link to stories that are not yet migrated; the section description should stay honest about that.

## Known gaps (fill when you can)

| Area | What’s missing |
|------|----------------|
| Continent hubs (non-Europe) | **Hero pull quotes** were removed as placeholders; only Europe keeps the Eddie Izzard line. Add real attributions when you have them, or leave quotes off. |
| Country hub SEO | Descriptions are generic (“Place stories and photos from …”). Richer, unique lines per country help search and sharing. |
| Migrated MDX | Some **descriptions** may be truncated from legacy meta or are article openers rather than standalone descriptions — spot-check against full article text. Nice is an example that needs a proper description. |
| Hiking hub MDX | Intro still mentions static-export limits; replace when pagination is final. |
| Other Work hub | `description` in frontmatter should expand beyond repeating the title. |
| Internal links | About page still points at legacy paths (e.g. `/blog/...`, `/contact`) where the Next app may use different routes — audit when those routes exist. |
| `/map-demo` | Dev-style map playground; copy is neutral. Remove from public nav or add `noindex` if it should not be indexed. |
| Copyright band on About | Ending year and “TogsTrek” styling may predate the current footer — align if policy changed. |
| Short place pages | Some pages (e.g. Nice) are trip-note fragments rather than standalone guides. Either expand them or add a brief context line so readers know what they’re getting. |

## Voice checklist (before publish)

1. One clear promise in the first screen (what you’ll find on this page).
2. Frontmatter `description` works as a standalone sentence — not the article opener.
3. No placeholder strings visible to visitors.
4. Apostrophes: **Tog’s Trek** (curly apostrophe in display copy where the design system allows).
5. Sentence case for long titles unless the line is a deliberate headline style.

## Reference snippets

- **Home lead (baseline):** Curious travel guides and photo essays that go deeper — countries, places, hikes, and the stories behind the frame.
- **Map section (continents):** Shared helper `togstrekHubOnTheMapSectionDescription` in `src/lib/togstrek-hub-section-copy.tsx`.
- **Countries list intro:** Shared `TogstrekHubCountriesListIntro` for consistent UN 195 wording.
- **Hiking trail intro (benchmark):** *”Every trail here has been walked from start to finish. No summaries, no lifted descriptions… All of them are documented in enough detail to be useful if you’re planning the same route, and honest enough to read if you’re not.”*
- **Place page benchmark:** Ushuaia — structured sections, personal asides that earn their place, practical detail without padding.

---

*Last reviewed with codebase copy pass — update this file when voice or IA changes.*
