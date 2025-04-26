import { test, expect } from "@playwright/test";
import { CardSetsPage } from "../page-objects/CardSetsPage";

test.describe("Zarządzanie zestawami fiszek", () => {
  let cardSetsPage: CardSetsPage;

  test.beforeEach(async ({ page }) => {
    cardSetsPage = new CardSetsPage(page);
    await cardSetsPage.goto();
  });

  test("powinien utworzyć nowy zestaw fiszek w chmurze", async () => {
    // Arrange
    const nazwa = "Mój nowy zestaw fiszek";

    // Act
    await cardSetsPage.clickNewCardSetButton();
    await cardSetsPage.modal.createCardSet(nazwa);

    // Assert
    await expect(cardSetsPage.cardSetGrid).toBeVisible();
    const cardSets = await cardSetsPage.getAllCardSets();
    expect(cardSets.length).toBeGreaterThan(0);

    const nowyZestaw = cardSets[0];
    await expect(nowyZestaw).toContainText(nazwa);
    await expect(nowyZestaw).not.toContainText("Lokalny");
  });

  test("nie powinien utworzyć zestawu z pustą nazwą", async () => {
    // Act
    await cardSetsPage.clickNewCardSetButton();
    await cardSetsPage.modal.fillName("");
    await cardSetsPage.modal.create();

    // Assert
    await expect(cardSetsPage.modal.dialog).toBeVisible();
    const errorMessage = await cardSetsPage.getErrorMessage("Nazwa zestawu jest wymagana");
    await expect(errorMessage).toBeVisible();
  });

  test("nie powinien utworzyć zestawu z nazwą dłuższą niż 100 znaków", async () => {
    // Arrange
    const zbytDlugaNazwa = "a".repeat(101);

    // Act
    await cardSetsPage.clickNewCardSetButton();
    await cardSetsPage.modal.fillName(zbytDlugaNazwa);
    await cardSetsPage.modal.create();

    // Assert
    await expect(cardSetsPage.modal.dialog).toBeVisible();
    const errorMessage = await cardSetsPage.getErrorMessage("Nazwa zestawu nie może być dłuższa niż 100 znaków");
    await expect(errorMessage).toBeVisible();
  });

  test("powinien anulować tworzenie zestawu", async () => {
    // Arrange
    const nazwa = "Zestaw do anulowania";
    const poczatkowaLiczbaZestawow = (await cardSetsPage.getAllCardSets()).length;

    // Act
    await cardSetsPage.clickNewCardSetButton();
    await cardSetsPage.modal.fillName(nazwa);
    await cardSetsPage.modal.cancel();

    // Assert
    await expect(cardSetsPage.modal.dialog).not.toBeVisible();
    await cardSetsPage.waitForAnimations();
    const aktualnaLiczbaZestawow = (await cardSetsPage.getAllCardSets()).length;
    expect(aktualnaLiczbaZestawow).toBe(poczatkowaLiczbaZestawow);
  });

  test("powinien zachować dane w formularzu po błędzie walidacji", async () => {
    // Arrange
    const nazwa = "a".repeat(101);

    // Act
    await cardSetsPage.clickNewCardSetButton();
    await cardSetsPage.modal.fillName(nazwa);
    await cardSetsPage.modal.create();

    // Assert
    await expect(cardSetsPage.modal.nameInput).toHaveValue(nazwa);
  });

  test("powinien wyczyścić formularz po pomyślnym utworzeniu zestawu", async () => {
    // Arrange
    const nazwa = "Testowy zestaw";

    // Act
    await cardSetsPage.clickNewCardSetButton();
    await cardSetsPage.modal.createCardSet(nazwa);
    await cardSetsPage.clickNewCardSetButton();

    // Assert
    await expect(cardSetsPage.modal.nameInput).toHaveValue("");
  });
});
