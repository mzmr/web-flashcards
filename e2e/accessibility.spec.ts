import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("sprawdź dostępność strony głównej", async ({ page }) => {
  await page.goto("/");

  // Przeprowadź analizę dostępności
  const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

  // Sprawdź, czy nie ma błędów dostępności
  const violations = accessibilityScanResults.violations;

  // Wyświetl szczegóły naruszeń dostępności
  console.log(violations);

  // Sprawdź, czy nie ma naruszeń o wysokim priorytecie
  const highImpactViolations = violations.filter((v) => v.impact === "critical" || v.impact === "serious");
  expect(
    highImpactViolations,
    "Nie powinno być naruszeń dostępności o wysokim priorytecie. Znalezione naruszenia:\n" +
      JSON.stringify(highImpactViolations, null, 2)
  ).toHaveLength(0);

  // TODO: Dodać te elementy do aplikacji i włączyć testy
  // await expect(page.locator('main')).toBeVisible();
  // await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
