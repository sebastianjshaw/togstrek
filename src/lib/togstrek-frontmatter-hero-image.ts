import type { TogstrekImageAsset } from "@/types/togstrek-place-page";

/**
 * Parse a `heroImage` frontmatter value, shared by place, adventure, hiking and
 * photography frontmatter.
 *
 * - Missing (`undefined` / `null`): returns `undefined` (the page has no hero).
 * - Present but malformed: throws, naming `source`, so a typo fails the build instead of
 *   silently dropping the hero (same as a missing `title` / `description`).
 */
export function parseTogstrekHeroImage(
  raw: unknown,
  source = "frontmatter",
): TogstrekImageAsset | undefined {
  if (raw === undefined || raw === null) return undefined;
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${source}: heroImage must be an object`);
  }
  const o = raw as Record<string, unknown>;
  const missing = (
    [
      ["basename", "string"],
      ["src", "string"],
      ["width", "number"],
      ["height", "number"],
      ["alt", "string"],
    ] as const
  )
    .filter(([key, type]) => typeof o[key] !== type)
    .map(([key, type]) => `${key} (${type})`);
  if (missing.length > 0) {
    throw new Error(`${source}: heroImage needs ${missing.join(", ")}`);
  }
  return {
    basename: o.basename as string,
    src: o.src as string,
    width: o.width as number,
    height: o.height as number,
    alt: o.alt as string,
    caption: typeof o.caption === "string" ? o.caption : undefined,
    credit: typeof o.credit === "string" ? o.credit : undefined,
    priority: o.priority === true,
  };
}
