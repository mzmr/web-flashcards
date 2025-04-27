# Plan wdrożenia feature flags

## Cel

Wprowadzić system feature flags, aby oddzielić deployment od release. System ma umożliwić kontrolę funkcjonalności na poziomie:
- endpointów API (np. generacja, auth),
- stron Astro (np. login.astro, register.astro, reset-password.astro, set-new-password.astro),
- widoczności pola do generowania fiszek z pomocą AI.

## Wymagania

1. Każda flaga domyślnie wyłączona.
2. Konfiguracja statyczna (ustalana w czasie budowy). 
3. Łatwo rozszerzalna o dodatkowe flagi w przyszłości.
4. Udostępnienie funkcji `isFeatureEnabled("nazwa_flagi")`, która zwraca stan flagi dla bieżącego środowiska.
5. Wszystkie flagi są eksponowane publicznie.

## Implementacja

- Utworzony moduł w `src/features/index.ts` w TypeScript.
- Użycie zmiennych środowiskowych odbywa się wyłącznie przez `import.meta.env.PUBLIC_ENV_NAME` (podobnie jak w podejściu z @supabase-auth.mdc).
- Konfiguracja flag jest zdefiniowana w statycznym obiekcie `flagsConfig`:
  ```typescript
  type Env = "local" | "integration" | "prod";

  interface FeatureFlags {
    auth: boolean;
    ai_generation: boolean;
  }

  const flagsConfig: Record<Env, FeatureFlags> = {
    local: { auth: false, ai_generation: false },
    integration: { auth: false, ai_generation: false },
    prod: { auth: false, ai_generation: false },
  };
  ```
- Funkcja `isFeatureEnabled(feature: keyof FeatureFlags)` zwraca wartość flagi w zależności od środowiska.

## Kolejne kroki

Po implementacji modułu, kolejne etapy integracji obejmą zmianę zachowania endpointów API oraz stron Astro na podstawie flag, umożliwiając włączanie/wyłączanie funkcjonalności wg środowiska. 