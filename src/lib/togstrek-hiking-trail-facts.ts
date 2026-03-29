/**
 * Best-effort extraction of **Distance** / **Difficulty** / **Transport** lines
 * from hiking MDX bodies (Trail Information section). Frontmatter overrides win.
 */

export type TogstrekHikingTrailFacts = {
  distanceKm?: number;
  difficulty?: string;
  transport?: string;
};

export function extractTogstrekHikingTrailFactsFromMarkdown(
  body: string,
): TogstrekHikingTrailFacts {
  const slice = body.slice(0, 12000);

  let distanceKm: number | undefined;
  const distanceMatch = slice.match(/\*\*Distance\*\*:\s*([\d.]+)\s*km\b/i);
  if (distanceMatch) {
    const n = parseFloat(distanceMatch[1]!);
    if (!Number.isNaN(n)) distanceKm = n;
  }

  const difficultyMatch = slice.match(/\*\*Difficulty\*\*:\s*([^\n]+?)(?:\n|$)/i);
  const transportMatch = slice.match(/\*\*Transport\*\*:\s*([^\n]+?)(?:\n|$)/i);

  return {
    distanceKm,
    difficulty: difficultyMatch?.[1]?.replace(/\s+$/, "").trim(),
    transport: transportMatch?.[1]?.replace(/\s+$/, "").trim(),
  };
}
