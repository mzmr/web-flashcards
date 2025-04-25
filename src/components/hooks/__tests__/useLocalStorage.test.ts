import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import type { Mock } from "vitest";
import { useLocalStorage } from "../useLocalStorage";
import type { UUID } from "@/types";

// Mock dla localStorage
const mockLocalStorage = {
  getItem: vi.fn() as Mock,
  setItem: vi.fn() as Mock,
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
  removeItem: vi.fn(),
} as Storage;

// Mock dla UUID
vi.mock("uuid", () => ({
  v4: () => "test-uuid" as UUID,
}));

describe("useLocalStorage", () => {
  const mockDate = "2024-01-01T12:00:00.000Z";

  beforeEach(() => {
    // Ustawienie mocka dla localStorage
    global.localStorage = mockLocalStorage;

    // Mock dla Date
    vi.setSystemTime(new Date(mockDate));

    // Czyszczenie wszystkich mocków przed każdym testem
    vi.clearAllMocks();

    // Domyślnie zwracamy pusty stan
    (mockLocalStorage.getItem as Mock).mockReturnValue(null);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Inicjalizacja", () => {
    it("powinien zwrócić pusty stan, gdy localStorage jest pusty", () => {
      (mockLocalStorage.getItem as Mock).mockReturnValue(null);

      const { result } = renderHook(() => useLocalStorage());

      expect(result.current.cardSets).toEqual([]);
    });

    it("powinien załadować istniejący stan z localStorage", () => {
      const mockState = {
        cardSets: [
          {
            id: "existing-id" as UUID,
            name: "Test Set",
            created_at: mockDate,
            updated_at: mockDate,
            isLocal: true,
            cards: [],
          },
        ],
        lastUpdate: mockDate,
      };

      (mockLocalStorage.getItem as Mock).mockReturnValue(JSON.stringify(mockState));

      const { result } = renderHook(() => useLocalStorage());

      expect(result.current.cardSets).toEqual(mockState.cardSets);
    });
  });

  describe("Operacje na zestawach kart", () => {
    it("powinien utworzyć nowy zestaw kart", () => {
      const { result } = renderHook(() => useLocalStorage());

      act(() => {
        result.current.createCardSet("Nowy zestaw");
      });

      const expectedSet = {
        id: "test-uuid",
        name: "Nowy zestaw",
        created_at: mockDate,
        updated_at: mockDate,
        isLocal: true,
        cards: [],
      };

      expect(result.current.cardSets).toContainEqual(expectedSet);
    });

    it("powinien zaktualizować nazwę zestawu kart", () => {
      // Przygotowanie początkowego stanu
      const initialSet = {
        id: "test-uuid" as UUID,
        name: "Stara nazwa",
        created_at: mockDate,
        updated_at: mockDate,
        isLocal: true,
        cards: [],
      };

      (mockLocalStorage.getItem as Mock).mockReturnValue(
        JSON.stringify({
          cardSets: [initialSet],
          lastUpdate: mockDate,
        })
      );

      const { result } = renderHook(() => useLocalStorage());

      // Ustawienie nowej daty dla aktualizacji
      const newDate = "2024-01-01T12:01:00.000Z";
      vi.setSystemTime(new Date(newDate));

      act(() => {
        result.current.updateCardSet("test-uuid", "Nowa nazwa");
      });

      expect(result.current.cardSets[0].name).toBe("Nowa nazwa");
      expect(result.current.cardSets[0].updated_at).toBe(newDate);
    });

    it("powinien usunąć zestaw kart", () => {
      const initialSet = {
        id: "test-uuid" as UUID,
        name: "Test Set",
        created_at: mockDate,
        updated_at: mockDate,
        isLocal: true,
        cards: [],
      };

      (mockLocalStorage.getItem as Mock).mockReturnValue(
        JSON.stringify({
          cardSets: [initialSet],
          lastUpdate: mockDate,
        })
      );

      const { result } = renderHook(() => useLocalStorage());

      act(() => {
        result.current.deleteCardSet("test-uuid");
      });

      expect(result.current.cardSets).toHaveLength(0);
    });
  });

  describe("Operacje na kartach", () => {
    it("powinien dodać nową kartę do zestawu", () => {
      const initialSet = {
        id: "test-uuid" as UUID,
        name: "Test Set",
        created_at: mockDate,
        updated_at: mockDate,
        isLocal: true,
        cards: [],
      };

      (mockLocalStorage.getItem as Mock).mockReturnValue(
        JSON.stringify({
          cardSets: [initialSet],
          lastUpdate: mockDate,
        })
      );

      const { result } = renderHook(() => useLocalStorage());

      act(() => {
        result.current.addCard("test-uuid", "Przód", "Tył");
      });

      const updatedSet = result.current.cardSets[0];
      expect(updatedSet.cards?.length).toBe(1);
      expect(updatedSet.cards?.[0]).toMatchObject({
        front: "Przód",
        back: "Tył",
        source: "user_created",
      });
    });

    it("powinien zaktualizować istniejącą kartę", () => {
      const initialCard = {
        id: "card-uuid" as UUID,
        front: "Stary przód",
        back: "Stary tył",
        source: "user_created",
        generation_id: null,
        created_at: mockDate,
        updated_at: mockDate,
      };

      const initialSet = {
        id: "test-uuid" as UUID,
        name: "Test Set",
        created_at: mockDate,
        updated_at: mockDate,
        isLocal: true,
        cards: [initialCard],
      };

      (mockLocalStorage.getItem as Mock).mockReturnValue(
        JSON.stringify({
          cardSets: [initialSet],
          lastUpdate: mockDate,
        })
      );

      const { result } = renderHook(() => useLocalStorage());

      const newDate = "2024-01-01T12:01:00.000Z";
      vi.setSystemTime(new Date(newDate));

      act(() => {
        result.current.updateCard("test-uuid", "card-uuid", {
          front: "Nowy przód",
          back: "Nowy tył",
        });
      });

      const updatedCard = result.current.cardSets[0].cards?.[0];
      expect(updatedCard?.front).toBe("Nowy przód");
      expect(updatedCard?.back).toBe("Nowy tył");
      expect(updatedCard?.updated_at).toBe(newDate);
    });

    it("powinien usunąć kartę z zestawu", () => {
      const initialCard = {
        id: "card-uuid" as UUID,
        front: "Przód",
        back: "Tył",
        source: "user_created",
        generation_id: null,
        created_at: mockDate,
        updated_at: mockDate,
      };

      const initialSet = {
        id: "test-uuid" as UUID,
        name: "Test Set",
        created_at: mockDate,
        updated_at: mockDate,
        isLocal: true,
        cards: [initialCard],
      };

      (mockLocalStorage.getItem as Mock).mockReturnValue(
        JSON.stringify({
          cardSets: [initialSet],
          lastUpdate: mockDate,
        })
      );

      const { result } = renderHook(() => useLocalStorage());

      act(() => {
        result.current.deleteCard("test-uuid", "card-uuid");
      });

      expect(result.current.cardSets[0].cards?.length).toBe(0);
    });
  });

  describe("Synchronizacja z localStorage", () => {
    it("powinien zapisywać stan do localStorage po każdej zmianie", () => {
      const { result } = renderHook(() => useLocalStorage());

      act(() => {
        result.current.createCardSet("Nowy zestaw");
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("flashcards-state", expect.any(String));

      const setItemCalls = (mockLocalStorage.setItem as Mock).mock.calls;
      expect(setItemCalls.length).toBeGreaterThan(0);

      const savedState = JSON.parse(setItemCalls[setItemCalls.length - 1][1]);
      expect(savedState.cardSets).toHaveLength(1);
      expect(savedState.lastUpdate).toBeDefined();
      expect(savedState.cardSets[0].name).toBe("Nowy zestaw");
    });
  });
});
