import { test, expect } from "@playwright/test";

test("podstawowy test e2e", async ({ page }) => {
  await page.goto("/");

  // Sprawdź, czy strona główna się załadowała
  await expect(page).toHaveTitle(/Zestawy fiszek/);

  // Dodaj więcej asercji, gdy interface będzie gotowy
});
