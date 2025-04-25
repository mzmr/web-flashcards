# Testy End-to-End (E2E) z Playwright

Ten katalog zawiera testy E2E dla aplikacji Web Flashcards.

## Struktura

```
e2e/
├── page-objects/     # Klasy Page Object dla poszczególnych stron
├── fixtures/         # Dane testowe
├── utils/            # Funkcje pomocnicze
└── *.spec.ts         # Pliki testów
```

## Page Object Pattern

Testy wykorzystują Page Object Pattern, który polega na:

1. Tworzeniu klas reprezentujących poszczególne strony
2. Enkapsulacji lokatorów i akcji w tych klasach
3. Pisaniu testów używających metod z klas Page Object
4. Oddzieleniu logiki testów od implementacji lokatorów

## Przykład użycia

```typescript
import { test } from '@playwright/test';
import { HomePage } from './page-objects/home.page';

test('użytkownik może zalogować się do aplikacji', async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.assertPageIsLoaded();
  
  // Inne akcje i asercje
});
```

## Testy dostępności

Testy dostępności wykorzystują bibliotekę axe-core, która:

1. Znajduje problemy z dostępnością
2. Sugeruje rozwiązania
3. Raportuje wyniki w czytelny sposób

## Uruchamianie testów

```bash
# Uruchomienie wszystkich testów E2E
npm run test:e2e

# Uruchomienie testów E2E z interfejsem graficznym
npm run test:e2e:ui
``` 