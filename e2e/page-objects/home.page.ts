import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly heading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole("heading", { level: 1 });
  }

  async goto() {
    await this.page.goto("/");
  }

  async assertPageIsLoaded() {
    await expect(this.page).toHaveTitle(/Zestawy fiszek/);
    await expect(this.heading).toBeVisible();
  }
}
