import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "on",
    video: "on-first-retry",
  },
  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  projects: [
    // Setup project do autentykacji
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "chromium-auth",
      testMatch: ["**/*.spec.ts"],
      testIgnore: ["**/*.setup.ts", "**/*.anon.spec.ts"],
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/user.json",
      },
    },

    {
      name: "chromium-anon",
      testMatch: "**/*.anon.spec.ts",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Konfiguracja serwera deweloperskiego
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 120 sekund na uruchomienie
    stdout: "pipe",
    stderr: "pipe",
  },
});
