import { defineConfig, devices } from "@playwright/test";

const port = Number.parseInt(process.env.PORT ?? "3000", 10) || 3000;
const baseURL = `http://127.0.0.1:${port}`;

/**
 * E2E runs against a production build (`next start`), not `next dev`.
 * Locally: `npm run build && npm run test:e2e` (or rely on `webServer` + existing `.next`).
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run start",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
