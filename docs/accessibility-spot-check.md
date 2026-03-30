# Accessibility spot checks

Run these after meaningful UI changes (especially nav, typography, or colour tokens).

1. **Keyboard** — Tab through header (desktop + mobile `<details>`), footer, and one long-form MDX page; every interactive control should show a visible **focus** state (`focus-visible` ring on links and summaries).
2. **Bypass** — Activate **Skip to content** (first tab stop); focus should land in `#togstrek-main` and main prose should follow a single `<main>` landmark.
3. **Mega menu** — Open a desktop mega panel via hover/focus; **Escape** closes it. Triggers expose `aria-expanded` and `aria-controls` pointing at `#togstrek-site-header-mega-panel`.
4. **Contrast** — In Chrome DevTools → Lighthouse → Accessibility (or axe), check **small uppercase** UI copy (e.g. nav labels) and **accent red** (`--tt-color-accent`) on white; adjust tokens or weight if any text fails WCAG 2.1 AA for its size.

For automated CI, add a Playwright + `@axe-core/playwright` pass against `/`, `/about`, and one place URL when you are ready to maintain it.
