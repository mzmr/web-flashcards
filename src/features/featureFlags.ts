/**
 * System feature flags umożliwiający kontrolę funkcjonalności na poziomie:
 * - endpointów API
 * - stron Astro
 * - widoczności komponentów UI
 */

export type Env = "local" | "integration" | "prod";

export interface FeatureFlags {
  auth: boolean;
  ai_generation: boolean;
}

const flagsConfig: Record<Env, FeatureFlags> = {
  local: { auth: true, ai_generation: true },
  integration: { auth: true, ai_generation: false },
  prod: { auth: true, ai_generation: true },
};

/**
 * Zwraca aktualne środowisko na podstawie zmiennych środowiskowych.
 * Domyślnie zwraca 'local' jeśli środowisko nie jest zdefiniowane.
 */
function getCurrentEnv(): Env | null {
  const env = import.meta.env.PUBLIC_ENV_NAME as Env;
  if (!env || !Object.keys(flagsConfig).includes(env)) {
    return null;
  }
  return env;
}

/**
 * Sprawdza czy dana funkcjonalność jest włączona w bieżącym środowisku.
 * @param feature - Nazwa funkcjonalności do sprawdzenia
 * @returns true jeśli funkcjonalność jest włączona, false w przeciwnym razie
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const currentEnv = getCurrentEnv();
  if (!currentEnv) {
    return false;
  }
  return flagsConfig[currentEnv][feature];
}

/**
 * Zwraca wszystkie flagi dla bieżącego środowiska.
 * @returns Obiekt zawierający wszystkie flagi i ich wartości
 */
export function getAllFeatureFlags(): FeatureFlags {
  const currentEnv = getCurrentEnv();
  if (!currentEnv) {
    return {
      auth: false,
      ai_generation: false,
    };
  }
  return flagsConfig[currentEnv];
}
