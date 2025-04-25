import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useCardSetDetails } from "../useCardSetDetails";
import { useLocalStorage } from "../useLocalStorage";
import { toast } from "sonner";
import type { CardSetDetailDTO, CardSource } from "@/types";

// Mockowanie modułów
vi.mock("../useLocalStorage", () => ({
  useLocalStorage: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mockowanie fetch API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("useCardSetDetails", () => {
  const mockId = "test-id";
  const mockCardSet: CardSetDetailDTO = {
    id: mockId,
    name: "Test Set",
    cards: [
      {
        id: "card-1",
        front: "Front 1",
        back: "Back 1",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        source: "user_created" as CardSource,
        generation_id: null,
      },
      {
        id: "card-2",
        front: "Front 2",
        back: "Back 2",
        created_at: "2024-01-01",
        updated_at: "2024-01-01",
        source: "user_created" as CardSource,
        generation_id: null,
      },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    isLocal: false,
  };

  const mockLocalStorageHook = {
    getCardSet: vi.fn(),
    updateCardSet: vi.fn(),
    deleteCardSet: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useLocalStorage as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockLocalStorageHook);
    mockFetch.mockReset();
  });

  // Test inicjalizacji z lokalnego storage
  it("powinien załadować zestaw z lokalnego storage", async () => {
    // Arrange
    mockLocalStorageHook.getCardSet.mockReturnValue(mockCardSet);

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.cardSet).toEqual(mockCardSet);
    expect(mockLocalStorageHook.getCardSet).toHaveBeenCalledWith(mockId);
  });

  // Test inicjalizacji z API
  it("powinien załadować zestaw z API gdy brak w lokalnym storage", async () => {
    // Arrange
    mockLocalStorageHook.getCardSet.mockReturnValue(null);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockCardSet),
    });

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.cardSet).toEqual(mockCardSet);
    expect(mockFetch).toHaveBeenCalledWith(`/api/card-sets/${mockId}`);
  });

  // Test obsługi błędów API
  it("powinien obsłużyć błąd podczas ładowania z API", async () => {
    // Arrange
    mockLocalStorageHook.getCardSet.mockReturnValue(null);
    mockFetch.mockRejectedValueOnce(new Error("API Error"));

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.error).toBeTruthy();
    expect(toast.error).toHaveBeenCalled();
  });

  // Test aktualizacji nazwy zestawu (lokalnie)
  it("powinien zaktualizować nazwę zestawu lokalnie", async () => {
    // Arrange
    const localCardSet = { ...mockCardSet, isLocal: true };
    mockLocalStorageHook.getCardSet.mockReturnValue(localCardSet);

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.updateCardSetName("New Name");
    });

    // Assert
    expect(mockLocalStorageHook.updateCardSet).toHaveBeenCalledWith(mockId, "New Name");
    expect(toast.success).toHaveBeenCalled();
  });

  // Test filtrowania kart
  it("powinien poprawnie filtrować karty", async () => {
    // Arrange
    mockLocalStorageHook.getCardSet.mockReturnValue(mockCardSet);

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setSearchTerm("Front 1");
    });

    // Assert
    expect(result.current.filteredCards).toHaveLength(1);
    expect(result.current.filteredCards[0].front).toBe("Front 1");
  });

  // Test usuwania karty
  it("powinien usunąć kartę z zestawu", async () => {
    // Arrange
    mockLocalStorageHook.getCardSet.mockReturnValue(mockCardSet);
    mockFetch.mockResolvedValueOnce({
      ok: true,
    });

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.deleteCard("card-1");
    });

    // Assert
    expect(mockFetch).toHaveBeenCalledWith(
      `/api/card-sets/${mockId}/cards/card-1`,
      expect.objectContaining({ method: "DELETE" })
    );
    expect(toast.success).toHaveBeenCalled();
  });

  // Test zapisywania do chmury
  it("powinien zapisać lokalny zestaw do chmury", async () => {
    // Arrange
    const localCardSet = { ...mockCardSet, isLocal: true };
    mockLocalStorageHook.getCardSet.mockReturnValue(localCardSet);
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ...mockCardSet, id: "new-cloud-id" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.saveToCloud();
    });

    // Assert
    expect(mockFetch).toHaveBeenCalledWith("/api/card-sets", expect.objectContaining({ method: "POST" }));
    expect(mockLocalStorageHook.deleteCardSet).toHaveBeenCalledWith(mockId);
    expect(toast.success).toHaveBeenCalled();
  });

  // Test warunków brzegowych
  it("powinien obsłużyć pusty zestaw kart", async () => {
    // Arrange
    const emptyCardSet = { ...mockCardSet, cards: [] };
    mockLocalStorageHook.getCardSet.mockReturnValue(emptyCardSet);

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.filteredCards).toHaveLength(0);
  });

  it("nie powinien wykonywać operacji gdy cardSet jest null", async () => {
    // Arrange
    mockLocalStorageHook.getCardSet.mockReturnValue(null);
    // Symulujemy nieudane pobranie danych z API
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    // Act
    const { result } = renderHook(() => useCardSetDetails(mockId));
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Resetujemy mock przed właściwym testem
    mockFetch.mockReset();

    await act(async () => {
      await result.current.updateCardSetName("New Name");
      await result.current.deleteCard("card-1");
      await result.current.updateCard("card-1", { front: "New Front", back: "New Back" });
    });

    // Assert
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockLocalStorageHook.updateCardSet).not.toHaveBeenCalled();
    expect(mockLocalStorageHook.deleteCard).not.toHaveBeenCalled();
    expect(mockLocalStorageHook.updateCard).not.toHaveBeenCalled();
  });
});
