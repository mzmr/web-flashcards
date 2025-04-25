import { vi, expect } from "vitest";
import * as matchers from "@testing-library/jest-dom/matchers";
import "@testing-library/jest-dom";

// Rozszerzamy expect o matchery z testing-library
expect.extend(matchers);

// Globalne mocki dla testów
vi.stubGlobal("matchMedia", () => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

// Ustawienie timeoutu dla testów
vi.setConfig({
  testTimeout: 10000,
});

// Wyciszenie ostrzeżeń dla testów
console.error = vi.fn();
console.warn = vi.fn();
