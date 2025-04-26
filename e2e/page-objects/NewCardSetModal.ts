import { BasePage } from "./BasePage";

export class NewCardSetModal extends BasePage {
  readonly nameInput = this.page.getByTestId("card-set-name-input");
  readonly createButton = this.page.getByTestId("create-card-set-button");
  readonly cancelButton = this.page.getByTestId("cancel-button");
  readonly dialog = this.page.getByRole("dialog");

  async waitForVisible() {
    await super.waitForVisible(this.dialog);
  }

  async waitForHidden() {
    await super.waitForHidden(this.dialog);
  }

  async fillName(name: string) {
    await this.nameInput.fill(name);
  }

  async create() {
    await this.createButton.click();
  }

  async cancel() {
    await this.cancelButton.click();
    await this.waitForHidden();
  }

  async createCardSet(name: string) {
    await this.fillName(name);
    await this.create();
    await this.waitForHidden();
  }
}
