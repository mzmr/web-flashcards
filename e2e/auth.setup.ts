import { test as setup, expect } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Załaduj zmienne środowiskowe z .env
dotenv.config();

// Utwórz odpowiednik __dirname dla modułów ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const authFile = path.join(__dirname, "../playwright/.auth/user.json");

setup("authenticate", async ({ page }) => {
  // Przejdź do strony logowania
  await page.goto("/auth/login");

  // Poczekaj na załadowanie formularza
  await page.waitForSelector("form", { state: "visible" });

  // Upewnij się, że pola są widoczne i interaktywne
  const emailInput = page.getByRole("textbox", { name: "Email" });
  const passwordInput = page.getByLabel("Hasło");

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();

  // Wyczyść pola przed wypełnieniem
  await emailInput.clear();
  await passwordInput.clear();

  // Wypełnij formularz logowania z dodatkowym sprawdzeniem
  await emailInput.fill(process.env.E2E_USERNAME || "");
  await emailInput.press("Tab"); // Przejdź do następnego pola
  await expect(emailInput).toHaveValue(process.env.E2E_USERNAME || "");

  await passwordInput.fill(process.env.E2E_PASSWORD || "");
  await expect(passwordInput).toHaveValue(process.env.E2E_PASSWORD || "");

  // Kliknij przycisk logowania
  const loginButton = page.getByRole("button", { name: "Zaloguj się" });
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  // Poczekaj na przekierowanie po zalogowaniu
  await page.waitForURL("/card-sets");

  // Zapisz stan autentykacji
  await page.context().storageState({ path: authFile });
});
