import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { testUsers } from "../fixtures/test-data";

/**
 * Loguje użytkownika do aplikacji
 */
export async function login(page: Page, userType: keyof typeof testUsers = "regularUser") {
  const user = testUsers[userType];

  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Hasło").fill(user.password);
  await page.getByRole("button", { name: "Zaloguj się" }).click();

  // Sprawdź, czy logowanie się powiodło
  await expect(page).toHaveURL(/dashboard/);
}

/**
 * Wylogowuje użytkownika z aplikacji
 */
export async function logout(page: Page) {
  await page.getByRole("button", { name: "Menu użytkownika" }).click();
  await page.getByRole("menuitem", { name: "Wyloguj" }).click();

  // Sprawdź, czy wylogowanie się powiodło
  await expect(page).toHaveURL(/\//);
}

/**
 * Generuje unikalną nazwę na podstawie aktualnego czasu
 */
export function generateUniqueName(prefix = "test") {
  return `${prefix}-${Date.now()}`;
}
