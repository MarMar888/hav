import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/optimization",
  outputDir: ".context/playwright-results",
  workers: 1,
  use: { baseURL: "http://localhost:3000", browserName: "chromium", channel: process.env.PLAYWRIGHT_CHANNEL },
  webServer: {
    command: "pnpm dev --port 3000",
    url: "http://localhost:3000/optimization",
    reuseExistingServer: !process.env.CI,
  },
});
