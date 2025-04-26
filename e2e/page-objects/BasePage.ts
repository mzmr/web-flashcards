import type { Page, Locator } from "@playwright/test";
import { expect } from "@playwright/test";

export class BasePage {
  constructor(protected page: Page) {}

  protected async waitForUrl(url: string) {
    await expect(this.page).toHaveURL(url);
  }

  protected async waitForVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  protected async waitForHidden(locator: Locator) {
    await expect(locator).toBeHidden();
  }
}
