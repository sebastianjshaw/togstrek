import AxeBuilder from "@axe-core/playwright";
import { expect, type Page } from "@playwright/test";

/**
 * Run axe on the current document and fail on serious/critical violations.
 * Moderate/minor issues are reported but do not fail CI (tune as the site hardens).
 */
export async function expectNoSeriousAxeViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();

  const serious = results.violations.filter(
    (v) => v.impact === "serious" || v.impact === "critical",
  );

  expect(
    serious,
    serious.length
      ? formatAxeReport(serious)
      : undefined,
  ).toEqual([]);
}

function formatAxeReport(
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
): string {
  return violations
    .map(
      (v) =>
        `[${v.impact}] ${v.id}: ${v.help}\n  ${v.nodes.length} node(s)\n  ${v.helpUrl}`,
    )
    .join("\n\n");
}
