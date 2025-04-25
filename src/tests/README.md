# Testy w Web Flashcards

## Testy jednostkowe (Vitest)

Testy jednostkowe pozwalają na weryfikację poprawności działania pojedynczych komponentów i funkcji.

### Uruchamianie testów jednostkowych

```bash
# Uruchomienie wszystkich testów jednostkowych
npm run test

# Uruchomienie testów w trybie watch (automatyczne odświeżanie)
npm run test:watch

# Uruchomienie testów z interfejsem graficznym
npm run test:ui

# Uruchomienie testów z pokryciem kodu
npm run test:coverage
```

### Struktura testów jednostkowych

- Testy komponentów powinny znajdować się w tych samych katalogach co komponenty
- Nazwa pliku testowego powinna mieć format `*.test.tsx` lub `*.spec.tsx`
- Testy funkcji pomocniczych powinny znajdować się w tych samych katalogach co funkcje

### Dobre praktyki

- Używaj `describe` do grupowania testów
- Używaj `it` do definiowania przypadków testowych
- Używaj `expect` do asercji
- Używaj `vi.fn()` do tworzenia mocków
- Używaj `vi.spyOn()` do monitorowania istniejących funkcji
- Używaj `vi.mock()` do mockowania modułów

## Testy E2E (Playwright)

Testy E2E pozwalają na weryfikację poprawności działania całej aplikacji z perspektywy użytkownika.

### Uruchamianie testów E2E

```bash
# Uruchomienie wszystkich testów E2E
npm run test:e2e

# Uruchomienie testów E2E z interfejsem graficznym
npm run test:e2e:ui
```

### Struktura testów E2E

- Testy E2E znajdują się w katalogu `e2e`
- Page Objects znajdują się w katalogu `e2e/page-objects`
- Testy powinny wykorzystywać Page Object Pattern

### Dobre praktyki

- Używaj Page Object Pattern do organizacji testów
- Używaj lokatorów do identyfikacji elementów
- Używaj `expect` do asercji
- Używaj `test.describe` do grupowania testów
- Używaj `test.beforeEach` do konfiguracji testów 