import { expect, test } from "@playwright/test";

/**
 * Post-refactor smoke: core static routes render without 5xx and expose expected landmarks.
 */
test.describe("smoke", () => {
  test("home /", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    // Home uses a top-level `div` (not `<main>`); hero H1 is the primary landmark.
    await expect(page.locator("#togstrek-home-hero-heading")).toBeVisible();
  });

  test("place page (Cairo)", async ({ page }) => {
    const res = await page.goto("/africa/egypt/cairo");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    const h1 = page
      .locator("#togstrek-place-hero-title, #togstrek-place-title")
      .first();
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText("Cairo");
  });

  test("search", async ({ page }) => {
    const res = await page.goto("/search");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(
      page.getByRole("heading", { level: 1, name: "Search" }),
    ).toBeVisible();
  });

  test("visited map", async ({ page }) => {
    const res = await page.goto("/visited-map");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(
      page.getByRole("heading", { level: 1, name: "Visited map" }),
    ).toBeVisible();
    await expect(
      page.locator("main.togstrek-visited-map-page"),
    ).toBeVisible();
  });
});
