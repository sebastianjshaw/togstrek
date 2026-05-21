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

  test("search /search", async ({ page }) => {
    const res = await page.goto("/search");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(page.locator("#togstrek-search-title")).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("hiking post Bohusleden etapp 04", async ({ page }) => {
    const res = await page.goto(
      "/hiking/bohusleden/etapp-04-kasjon-to-jonsered",
    );
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(page.locator("#togstrek-main")).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });

  test("adventure 2025 The Book of the Dead", async ({ page }) => {
    const res = await page.goto("/adventures/2025-the-book-of-the-dead");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(
      page.getByRole("heading", { name: /book of the dead/i }).first(),
    ).toBeVisible();
    await expectNoSeriousAxeViolations(page);
  });
});
