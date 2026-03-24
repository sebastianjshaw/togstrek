# Togstrek design system

Tokens live in `src/styles/tokens.css` and are wired into Tailwind in `src/app/globals.css`. This document describes **interaction patterns** that are not fully expressed by tokens alone.

## Editorial media card

**Use for:** dense grids of story or place links where the photograph carries the mood and the title sits on the image (adventures archive, future portfolio hubs).

**Do not use for:** primary nav mega tiles (different context/contrast), compact list rows (`TogstrekLinkCard` compact), or full-width region marketing cards (`TogstrekLinkCard` region) unless you intentionally want this richer treatment.

### Anatomy

1. **Focusable link** — Wraps the whole card. Use a visible focus ring: `ring-2 ring-tt-accent` with offset against the page surface (`ring-offset-4 ring-offset-tt-surface-base`).
2. **Frame** — Rounded container (`--tt-radius-editorial-xl`), `aspect-[3/2]`, `ring-1 ring-tt-border-muted`, `shadow-[var(--tt-shadow-sm)]`.
3. **Accent bar** — Full-width bar at top edge (`--tt-editorial-accent-bar-height`), gradient `from-tt-accent via-tt-accent/80 to-transparent`. Default state: `scale-x-0 origin-left`; **hover:** `scale-x-100` with `--tt-duration-slow` and `--tt-ease-out`.
4. **Media** — `object-cover`, **hover:** `scale-[1.07]` over `--tt-duration-slower`, slight `brightness` / `contrast` bump.
5. **Vignette** — Radial ellipse, `mix-blend-multiply`, opacity increases slightly on hover.
6. **Bottom scrim** — Linear gradient from ink-strong at the bottom (readable type).
7. **Accent wash** — Full-area `bg-tt-accent` at 0% opacity → ~12% on hover (tint only).
8. **Copy stack** — Overline (accent, uppercase, tight tracking), then title (inverse, heavy shadow), then optional **micro-CTA** (below).

### Frame motion (hover)

- Translate frame **up** (`-translate-y-2`, i.e. 0.5rem) with `will-change: transform`.
- Shadow → `--tt-shadow-elevated`.
- Ring tint → `ring-tt-accent/40`.

Use `--tt-duration-slow` (500ms) for frame ring/shadow; `--tt-duration-slower` (700ms) for image zoom so motion feels layered.

### Reduced motion

When `prefers-reduced-motion: reduce`:

- Disable frame lift (keep `translate-y-0` on hover).
- Keep subtle shadow/ring change or flatten to default—project choice: **cancel lift and image scale**, keep scrim/bar transitions instant or minimal.
- **Micro-CTA:** always visible (`opacity-100`, `translate-y-0`) so the affordance is not hidden behind animation.

Implemented on `TogstrekEditorialMediaCard` via `motion-reduce:*` utilities.

## Micro-CTA

**Use for:** short secondary line under a title on a card or tile (“Open the story”, “View on map”, “Read more”).

### Structure

- **Accent rule** — Horizontal hairline, `w-8`, `from-tt-accent to-transparent`.
- **Label** — `font-tt-body`, `text-[length:var(--tt-text-small)]`, `font-semibold`, inverse or near-inverse.
- **Arrow** — `→` in a span; **hover:** `translate-x-1` with `--tt-duration-normal`.

### Default vs hover

- **Default:** row `opacity-0`, `translate-y-3` (slightly below final position).
- **Group hover** (parent link/card has `.group`): `opacity-100`, `translate-y-0`, duration `--tt-duration-micro-reveal` (400ms) with `--tt-ease-out`.

### Accessibility

- The **link**’s accessible name must come from visible text (e.g. `h3` title). Keep **image `alt=""`** when the title is redundant inside the same link.
- Do not rely on micro-CTA alone for the control’s name.

## Reference implementation

- Component: `src/components/togstrek-ui/togstrek-editorial-media-card.tsx`
- Example usage: `src/components/togstrek-adventures/togstrek-adventures-page.tsx` (adventure archive grid)
