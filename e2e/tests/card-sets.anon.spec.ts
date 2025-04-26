import { test, expect } from "@playwright/test";
import { CardSetsPage } from "../page-objects/CardSetsPage";

test.describe("Zarządzanie zestawami fiszek - użytkownik niezalogowany", () => {
  let cardSetsPage: CardSetsPage;

  test.beforeEach(async ({ page }) => {
    cardSetsPage = new CardSetsPage(page);
    await cardSetsPage.goto();
  });

  test("powinien utworzyć nowy lokalny zestaw fiszek", async () => {
    // Arrange
    const nazwa = "Mój lokalny zestaw";

    // Act
    await cardSetsPage.clickNewCardSetButton();
    await cardSetsPage.modal.createCardSet(nazwa);
    await cardSetsPage.waitForAnimations();

    // Assert
    await expect(cardSetsPage.cardSetGrid).toBeVisible();
    const cardSets = await cardSetsPage.getAllCardSets();
    expect(cardSets.length).toBeGreaterThan(0);

    const nowyZestaw = cardSets[0];
    await expect(nowyZestaw).toContainText(nazwa);
    await expect(nowyZestaw).toContainText("Lokalny");
  });
});
