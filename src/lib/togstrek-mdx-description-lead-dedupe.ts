/**
 * Skip rendering frontmatter `description` as a visible lead when it repeats the
 * start of the MDX body (common after Squarespace migration: YAML description
 * copied the first paragraph).
 *
 * Used by: other-work, photography, place, and hiking MDX loaders + templates.
 */

function stripMarkdownLinksToPlain(text: string): string {
  return text.replace(/\[([^\]]+)]\([^)]+\)/g, "$1");
}

function normalizeComparableProse(text: string): string {
  return stripMarkdownLinksToPlain(text).replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * First prose block in MDX/markdown body (after frontmatter is removed).
 * Skips headings, fenced blocks, images, HTML, and list-only opens.
 */
export function extractFirstMarkdownProseBlock(body: string): string | undefined {
  const trimmed = body.trim();
  if (!trimmed) return undefined;

  const blocks = trimmed.split(/\n\s*\n+/);
  for (const raw of blocks) {
    const b = raw.trim();
    if (!b) continue;
    const firstLine = b.split("\n")[0]?.trim() ?? "";
    if (/^#{1,6}\s/.test(firstLine)) continue;
    if (/^!\[/.test(firstLine)) continue;
    if (/^<[A-Za-z!?/]/.test(firstLine)) continue;
    if (/^[-*+]\s/.test(firstLine)) continue;
    if (/^\d+\.\s/.test(firstLine)) continue;
    if (/^```/.test(firstLine)) continue;
    if (/^>\s/.test(firstLine)) continue;
    return b.replace(/\s*\n\s*/g, " ").trim();
  }
  return undefined;
}

/**
 * When true, do not render `description` above the article — the body already
 * opens with the same (or extended) copy. Metadata may still use `description`.
 */
export function shouldOmitVisibleDescriptionLead(
  description: string | undefined,
  mdxBodyAfterFrontmatter: string,
): boolean {
  const d = description?.trim();
  if (!d) return false;

  const first = extractFirstMarkdownProseBlock(mdxBodyAfterFrontmatter);
  if (!first) return false;

  const nd = normalizeComparableProse(d);
  const nf = normalizeComparableProse(first);
  if (!nd || !nf) return false;

  if (nd === nf) return true;
  if (nf.startsWith(nd)) return true;
  if (nd.startsWith(nf)) return true;

  return false;
}
