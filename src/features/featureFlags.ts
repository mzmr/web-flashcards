/**
 * @fileoverview Moduł zarządzający flagami funkcjonalności (feature flags) w systemie.
 * Umożliwia kontrolę dostępności funkcji na różnych poziomach aplikacji:
 * - endpointów API
 * - stron Astro
 * - widoczności komponentów UI
 *
 * @module featureFlags
 */

/**
 * Typ reprezentujący dostępne środowiska wykonawcze aplikacji.
 * @typedef {'local' | 'integration' | 'prod'} Env
 */
export type Env = "local" | "integration" | "prod";

/**
 * Interfejs definiujący dostępne flagi funkcjonalności w systemie.
 * @interface FeatureFlags
 * @property {boolean} auth - Flaga kontrolująca funkcjonalność autoryzacji
 * @property {boolean} ai_generation - Flaga kontrolująca funkcjonalność generowania AI
 */
export interface FeatureFlags {
  auth: boolean;
  ai_generation: boolean;
}

/**
 * Konfiguracja flag funkcjonalności dla różnych środowisk.
 * @type {Record<Env, FeatureFlags>}
 * @private
 */
const flagsConfig: Record<Env, FeatureFlags> = {
  local: { auth: true, ai_generation: true },
  integration: { auth: true, ai_generation: false },
  prod: { auth: true, ai_generation: true },
};

/**
 * Pobiera informację o aktualnym środowisku na podstawie zmiennych środowiskowych.
 *
 * @private
 * @returns {Env | null} Nazwa aktualnego środowiska lub null w przypadku błędu
 * @throws {never} Funkcja nie rzuca wyjątków
 *
 * @example
 * const env = getCurrentEnv();
 * if (env === 'prod') {
 *   // Logika dla środowiska produkcyjnego
 * }
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
 *
 * @param {keyof FeatureFlags} feature - Nazwa funkcjonalności do sprawdzenia
 * @returns {boolean} true jeśli funkcjonalność jest włączona, false w przeciwnym razie
 *
 * @example
 * if (isFeatureEnabled('auth')) {
 *   // Logika dla włączonej autoryzacji
 * }
 *
 * @throws {never} Funkcja nie rzuca wyjątków
 * @see {@link FeatureFlags} dla listy dostępnych flag
 */
export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  const currentEnv = getCurrentEnv();
  if (!currentEnv) {
    return false;
  }
  return flagsConfig[currentEnv][feature];
}

/**
 * Pobiera wszystkie flagi funkcjonalności dla bieżącego środowiska.
 *
 * @returns {FeatureFlags} Obiekt zawierający wszystkie flagi i ich wartości
 *
 * @example
 * const flags = getAllFeatureFlags();
 * console.log(flags.auth); // true/false
 *
 * @throws {never} Funkcja nie rzuca wyjątków
 * @see {@link FeatureFlags} dla struktury zwracanego obiektu
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
