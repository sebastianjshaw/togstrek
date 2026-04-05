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
| Country hubs without your photos | Use **illustrated / non-photographic header art** (see below); do not use stock photos that pretend to be yours. |
| Short place pages | Some pages (e.g. Nice) are trip-note fragments rather than standalone guides. Either expand them or add a brief context line so readers know what they’re getting. |

## Country hub header art (visited, no photographs yet)

When a country has a hub page but you have **no suitable hero photograph** of your own, the header image should **read clearly as not a photograph** — illustration, stylised digital painting, or graphic narrative art — while still **evoking the place** and fitting **Tog’s Trek**: grounded, atmospheric, editorial rather than brochure-glossy.

**Principles**

- **Honesty over realism.** Viewers should not mistake the image for a camera capture. Avoid photorealistic AI that mimics DSLR output.
- **Mood from your words.** Base the scene on a short **written brief** you supply (terrain, light, architecture, a single human-scale detail, season if it matters) so the image ties to *your* memory of the trip, not generic travel posters.
- **Restrained palette.** Prefer muted, naturalistic colour with one or two accents; no neon HDR or stock “golden hour” cliché unless you describe that truthfully.
- **Accessibility and metadata.** In `heroImage.alt`, say that it is an illustration (e.g. *Illustration: dawn over the Tian Shan above Bishkek*) so screen readers and future you know the source.

### Canonical illustration language (consistent across countries)

Use **generic schools and disciplines** — not individual painters — so prompts stay repeatable and you are not steering the model toward copying a famous work.

**Primary look — limited-palette gouache / poster-colour discipline**

This is the **default visual language** for country hub heroes: **opaque colour in controlled planes**, **muted saturation**, a **small deliberate palette** (earth, stone, sky, one accent if needed). **Soft blends only** where atmosphere demands it — sky haze, distant hills, weather — otherwise keep edges readable and **poster-like**. The result should feel **documentary and edited**: hand-painted, observed, not HDR, not concept-art epic, not airbrushed glamour.

**Editorial intent — reportage / illustrated journalism**

Compose like **reportage illustration** or an **illustrated travel feature**: observational, place-led, clear structure, priority on *place* over decoration — honest framing and human scale. That matches *first person, grounded* and *earnest, not hype*.

**Optional accent (only if you want extra graphic punch)**

**Printmaking-informed** touches — slightly flatter shapes or stronger silhouette — can layer on top of gouache discipline; keep them secondary so the default stays painterly-planes, not woodcut-first.

**Poor fits for this site (avoid as style anchors)**

- Photorealistic **concept art** or game-key-art lighting  
- **Airbrush** glamour and **HDR** “epic” travel posters  
- Heavy **art-nouveau** ornament or **surrealist** dream logic unless the copy explicitly calls for it  
- **Children’s-book** whimsy as the default (fine for a family place page if the text earns it)

**One-line style string for prompts**

Use this verbatim whenever you want a quick anchor: **Limited-palette gouache / poster-colour discipline** — opaque planes, muted saturation, documentary not glossy — in the tradition of **reportage / editorial travel illustration**, not photography.

**Output:** Aim for dimensions that work as a wide hero and in Open Graph crops (site OG assets are **1200×630** in `togstrek-metadata.ts`; a **3:2** or **16:9** master can be cropped). Export as you would other `media.togstrek.com` country assets.

### Master prompt (copy, then replace the bracketed line)

Use this as a **single prompt** in your image model of choice. Keep the **STYLE AND CONSTRAINTS** block verbatim for consistency across countries; only change the **PLACE BRIEF**.

```
STYLE AND CONSTRAINTS — apply to the whole image:
Editorial travel illustration for an independent travel journal (Tog’s Trek). Primary visual language: LIMITED-PALETTE GOUACHE / POSTER-COLOUR DISCIPLINE — opaque paint in flat to gently graded planes, a restrained palette (muted earth, stone, sky, at most one accent), soft blending ONLY for atmosphere (sky, haze, distant rain) not for fake photographic bokeh. Readable edges and composed shapes like a travel feature layout painting: documentary, edited, hand-made — not HDR, not concept-art key lighting, not airbrush glamour. Compositional intent: reportage / illustrated journalism — observational, place-led, nonfiction travel feature. Clearly NOT a photograph: no shallow depth-of-field blur, no lens flare, no watermarks, no text in the image. Not sentimental or tourist-brochure. No identifiable real people’s faces; silhouettes or distant figures only if needed. Evocative of place through landscape, architecture, light, and weather — grounded and specific, not generic “travel stock”. High enough resolution for a website hero banner.

PLACE BRIEF — replace this entire paragraph with your own 3–5 sentences (memory, season, time of day, what stuck with you):
[Describe the country or region as you experienced it: key landforms, city texture, light, weather, one telling detail. What should the viewer *feel* about being there?]

Compose one wide landscape-orientation scene that merges the place brief with the style constraints above.
```

**Optional add-ons** (append only if they help; don’t contradict the “not a photo” rule):

- *Medium cue:* e.g. “Slight visible paper tooth under gouache” or “Fewer colours — restrict to four main hues” or “Stronger poster-style silhouette on the skyline”.
- *Avoid:* naming specific artists, “photorealistic”, “8K DSLR”, “National Geographic style”, “hyperdetailed skin”, “HDR”.

---

## Voice checklist (before publish)

1. One clear promise in the first screen (what you’ll find on this page).
2. Frontmatter `description` works as a standalone sentence — not the article opener.
3. No placeholder strings visible to visitors.
4. Apostrophes: **Tog’s Trek** (curly apostrophe in display copy where the design system allows).
5. Sentence case for long titles unless the line is a deliberate headline style.
6. **Country hub heroes:** If the header is illustrated or AI-generated, `heroImage.alt` states that (see *Country hub header art* above).

## Reference snippets

- **Home lead (baseline):** Curious travel guides and photo essays that go deeper — countries, places, hikes, and the stories behind the frame.
- **Map section (continents):** Shared helper `togstrekHubOnTheMapSectionDescription` in `src/lib/togstrek-hub-section-copy.tsx`.
- **Countries list intro:** Shared `TogstrekHubCountriesListIntro` for consistent UN 195 wording.
- **Hiking trail intro (benchmark):** *”Every trail here has been walked from start to finish. No summaries, no lifted descriptions… All of them are documented in enough detail to be useful if you’re planning the same route, and honest enough to read if you’re not.”*
- **Place page benchmark:** Ushuaia — structured sections, personal asides that earn their place, practical detail without padding.

---

*Last updated: country hub illustrated-hero prompt and checklist — update when voice, IA, or image workflow changes.*
