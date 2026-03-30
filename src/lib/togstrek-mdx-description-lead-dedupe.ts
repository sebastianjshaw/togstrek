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

/** Edit distance — used to treat YAML vs body as duplicate when only typos differ. */
function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array<number>(n + 1);
  const cur = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    cur[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + cost,
      );
    }
    for (let j = 0; j <= n; j++) prev[j] = cur[j]!;
  }
  return prev[n]!;
}

/**
 * True when two normalized strings differ only by minor typos / punctuation noise
 * (same migration duplicate, not two distinct paragraphs).
 */
function proseNearlyDuplicate(a: string, b: string): boolean {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen < 28) return false;
  const dist = levenshteinDistance(a, b);
  return dist / maxLen <= 0.05;
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
  if (proseNearlyDuplicate(nd, nf)) return true;

  return false;
}
