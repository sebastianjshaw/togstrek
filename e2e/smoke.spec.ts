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

  test("adventures index", async ({ page }) => {
    const res = await page.goto("/adventures");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await expect(page.locator("#togstrek-adventures-hero-title")).toHaveText(
      "Exploration & Adventure",
    );
    await percySnapshot(page, "Adventures index");
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

  test("adventure page (2026 Asia)", async ({ page }) => {
    const res = await page.goto("/adventures/2026-asia");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    const h1 = page.locator("#togstrek-adventure-story-hero-title");
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText("2026: Gods & Glass");
    await percySnapshot(page, "Adventure detail (2026 Asia)");
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

  test("place page (Tokmok)", async ({ page }) => {
    const res = await page.goto("/asia/kyrgyzstan/tokmok");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    const h1 = page
      .locator("#togstrek-place-hero-title, #togstrek-place-title")
      .first();
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText("Tokmok");
    await percySnapshot(page, "Place detail (Tokmok)");
  });

  test("place page (Port Charcot)", async ({ page }) => {
    const res = await page.goto("/antarctica/port-charcot");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    const h1 = page
      .locator("#togstrek-place-hero-title, #togstrek-place-title")
      .first();
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText("Port Charcot");
    await percySnapshot(page, "Place detail (Port Charcot)");
  });

  test("search results (Kungsleden)", async ({ page }) => {
    const res = await page.goto("/search");
    expect(res?.ok(), res?.status().toString()).toBeTruthy();
    await page.locator("#togstrek-search-input").fill("Kungsleden");
    await expect(
      page.locator(".togstrek-search-result").first(),
    ).toBeVisible();
    await percySnapshot(page, "Search results (Kungsleden)");
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
