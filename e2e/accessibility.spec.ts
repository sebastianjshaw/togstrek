import { expect, test } from "@playwright/test";

import { expectNoSeriousAxeViolations } from "./togstrek-axe";

/**
 * Automated a11y smoke — serious/critical axe violations only.
 * Pair with manual checks in docs/accessibility-spot-check.md.
 */
test.describe("accessibility (axe)", () => {
  test("home /", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(page.locator("#togstrek-main")).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("about /about", async ({ page }) => {
    const res = await page.goto("/about");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(page.locator("#togstrek-main")).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("place page Cairo /africa/egypt/cairo", async ({ page }) => {
    const res = await page.goto("/africa/egypt/cairo");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(
      page.locator("#togstrek-place-hero-title, #togstrek-place-title").first(),
    ).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });
});
