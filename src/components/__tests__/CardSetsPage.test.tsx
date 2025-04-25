import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardSetsPage } from "../CardSetsPage";
import * as useLocalStorageModule from "@/components/hooks/useLocalStorage";

// Mock dla hooka useLocalStorage
vi.mock("@/components/hooks/useLocalStorage", () => ({
  useLocalStorage: vi.fn(),
}));

// Mock dla fetch API
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("CardSetsPage", () => {
  const mockCardSets = [
    {
      id: "1",
      name: "Test Set 1",
      created_at: "2024-03-20T10:00:00Z",
      updated_at: "2024-03-20T10:00:00Z",
    },
    {
      id: "2",
      name: "Test Set 2",
      created_at: "2024-03-20T11:00:00Z",
      updated_at: "2024-03-20T11:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Domyślna implementacja useLocalStorage
    vi.mocked(useLocalStorageModule.useLocalStorage).mockReturnValue({
      cardSets: [],
      createCardSet: vi.fn(),
      updateCardSet: vi.fn(),
      deleteCardSet: vi.fn(),
      getCardSet: vi.fn(),
      addCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
    });
    // Domyślna implementacja fetch
    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          cardSets: mockCardSets,
          pagination: { page: 1, limit: 10, total: 2 },
        }),
    });
  });

  // Test renderowania komponentu dla niezalogowanego użytkownika
  it("renderuje komponent dla niezalogowanego użytkownika", () => {
    // Arrange
    const localCardSets = [mockCardSets[0]];
    vi.mocked(useLocalStorageModule.useLocalStorage).mockReturnValue({
      cardSets: localCardSets,
      createCardSet: vi.fn(),
      updateCardSet: vi.fn(),
      deleteCardSet: vi.fn(),
      getCardSet: vi.fn(),
      addCard: vi.fn(),
      updateCard: vi.fn(),
      deleteCard: vi.fn(),
    });

    // Act
    render(<CardSetsPage isAuthenticated={false} />);

    // Assert
    expect(screen.getByText("1 zestaw fiszek")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /nowy zestaw/i })).toBeInTheDocument();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  // Test renderowania komponentu dla zalogowanego użytkownika
  it("pobiera i wyświetla zestawy kart dla zalogowanego użytkownika", async () => {
    // Arrange & Act
    render(<CardSetsPage isAuthenticated={true} />);

    // Assert
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("/api/card-sets?page=1&limit=10&sort=updated_at"));
    });

    await waitFor(() => {
      expect(screen.getByText("2 zestawy fiszek")).toBeInTheDocument();
    });
  });

  // Test obsługi błędów
  it("wyświetla komunikat błędu gdy pobieranie danych nie powiedzie się", async () => {
    // Arrange
    const errorMessage = "Błąd sieci";
    mockFetch.mockRejectedValueOnce(new Error(errorMessage));

    // Act
    render(<CardSetsPage isAuthenticated={true} />);

    // Assert
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText("Spróbuj ponownie")).toBeInTheDocument();
    });
  });

  // Test paginacji
  it("obsługuje paginację", async () => {
    // Arrange
    const user = userEvent.setup();
    mockFetch.mockImplementation((url) => {
      if (typeof url === "string") {
        const searchParams = new URLSearchParams(url.split("?")[1]);
        const page = searchParams.get("page") || "1";
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              cardSets: mockCardSets,
              pagination: { page: Number(page), limit: 10, total: 25 },
            }),
        });
      }
      throw new Error("Invalid URL");
    });

    render(<CardSetsPage isAuthenticated={true} />);

    // Czekamy na załadowanie pierwszej strony
    await screen.findByText(/25 zestawów fiszek/);

    // Act - kliknięcie przycisku następnej strony
    const nextPageButton = screen.getByLabelText("Następna strona");
    await user.click(nextPageButton);

    // Assert
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining("page=2"));
    });
  });

  // Test dodawania nowego zestawu
  it("otwiera modal do tworzenia nowego zestawu", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CardSetsPage isAuthenticated={true} />);

    // Czekamy na załadowanie komponentu
    await screen.findByText("2 zestawy fiszek");

    // Act
    const newSetButton = screen.getByRole("button", { name: /nowy zestaw/i });
    await user.click(newSetButton);

    // Assert
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // Test stanu ładowania
  it("wyświetla skeleton loader podczas ładowania danych", () => {
    // Arrange
    mockFetch.mockImplementationOnce(() => new Promise(() => undefined)); // Never resolving promise

    // Act
    render(<CardSetsPage isAuthenticated={true} />);

    // Assert
    expect(screen.getAllByTestId("skeleton")).toHaveLength(8); // 2 w nagłówku + 6 w siatce
  });
});
