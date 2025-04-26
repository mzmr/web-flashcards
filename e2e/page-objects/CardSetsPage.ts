import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { NewCardSetModal } from "./NewCardSetModal";

export class CardSetsPage extends BasePage {
  readonly newCardSetButton = this.page.getByTestId("new-card-set-button");
  readonly cardSetGrid = this.page.getByTestId("card-set-grid");
  readonly syncButton = this.page.getByTestId("sync-button");
  readonly modal: NewCardSetModal;

  constructor(page: Page) {
    super(page);
    this.modal = new NewCardSetModal(page);
  }

  async goto() {
    await this.page.goto("/card-sets");
    await this.waitForUrl("/card-sets");
  }

  async clickNewCardSetButton() {
    await this.newCardSetButton.click();
    await this.modal.waitForVisible();
  }

  async getCardSet(id: string) {
    return this.page.getByTestId(`card-set-${id}`);
  }

  async expectCardSetVisible(id: string) {
    const cardSet = await this.getCardSet(id);
    await expect(cardSet).toBeVisible();
  }

  async expectCardSetNotVisible(id: string) {
    const cardSet = await this.getCardSet(id);
    await expect(cardSet).not.toBeVisible();
  }

  async getAllCardSets() {
    return this.page.getByTestId(/^card-set-/).all();
  }

  async getErrorMessage(text: string) {
    return this.page.getByText(text);
  }

  async getSyncButton() {
    return this.syncButton;
  }

  async waitForAnimations() {
    await this.cardSetGrid.waitFor({ state: "visible" });
    await this.page.waitForTimeout(300);
  }
}
