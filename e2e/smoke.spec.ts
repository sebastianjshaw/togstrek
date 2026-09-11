import { expect, test } from "@playwright/test";
import percySnapshot from "@percy/playwright";

/**
 * Post-refactor smoke: core static routes render without 5xx and expose expected landmarks.
 */
test.describe("smoke", () => {
  test("home /", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(page.locator("#togstrek-main")).toBeVisible();
    await expect(page.locator("#togstrek-home-hero-heading")).toBeVisible();
    await percySnapshot(page, "Home");
  });

  test("adventure page (Egypt 2025) shows place cards", async ({ page }) => {
    const res = await page.goto("/adventures/2025-the-book-of-the-dead");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    const featured = page.locator(".togstrek-adventure-featured-section");
    await expect(featured).toBeVisible();
    await expect(featured.locator(".togstrek-adventure-featured-place-card")).toHaveCount(
      6,
    );
    await expect(
      featured.getByRole("heading", { level: 3, name: "Cairo" }),
    ).toBeVisible();
    await percySnapshot(page, "Adventure detail (Egypt 2025)");
  });

  test("place page (Cairo)", async ({ page }) => {
    const res = await page.goto("/africa/egypt/cairo");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    const h1 = page
      .locator("#togstrek-place-hero-title, #togstrek-place-title")
      .first();
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText("Cairo");
    await percySnapshot(page, "Place detail (Cairo)");
  });

  test("search", async ({ page }) => {
    const res = await page.goto("/search");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(
      page.getByRole("heading", { level: 1, name: "Search" }),
    ).toBeVisible();
    await percySnapshot(page, "Search");
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
    await percySnapshot(page, "Visited map");
  });
});
