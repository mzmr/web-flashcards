import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NewCardSetModal } from "../NewCardSetModal";

// Mock hooka useLocalStorage
const mockCreateCardSet = vi.fn((name) => ({
  id: "local-123",
  name,
  cards: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

vi.mock("@/components/hooks/useLocalStorage", () => ({
  useLocalStorage: () => ({
    createCardSet: mockCreateCardSet,
  }),
}));

// Mock fetch dla testów API
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("NewCardSetModal", () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    onCardSetAdded: vi.fn(),
    isAuthenticated: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  // Testy dla podstawowej funkcjonalności
  describe("Rendering and basic interactions", () => {
    it("renderuje się poprawnie z podstawowymi elementami", () => {
      render(<NewCardSetModal {...defaultProps} />);

      expect(screen.getByText("Nowy zestaw fiszek")).toBeInTheDocument();
      expect(screen.getByLabelText("Nazwa zestawu")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /utwórz zestaw/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
    });

    it("wyświetla różne opisy w zależności od stanu autentykacji", () => {
      const { rerender } = render(<NewCardSetModal {...defaultProps} />);
      expect(screen.getByText(/zostanie zapisany w pamięci przeglądarki/i)).toBeInTheDocument();

      rerender(<NewCardSetModal {...defaultProps} isAuthenticated={true} />);
      expect(screen.getByText(/później będziesz mógł dodać do niego fiszki/i)).toBeInTheDocument();
    });
  });

  // Testy walidacji
  describe("Validation", () => {
    it("pokazuje błąd gdy nazwa jest pusta", async () => {
      render(<NewCardSetModal {...defaultProps} />);

      await userEvent.click(screen.getByRole("button", { name: /utwórz zestaw/i }));

      expect(screen.getByText("Nazwa zestawu jest wymagana")).toBeInTheDocument();
      expect(defaultProps.onCardSetAdded).not.toHaveBeenCalled();
    });

    it("pokazuje błąd gdy nazwa jest za długa (>100 znaków)", async () => {
      render(<NewCardSetModal {...defaultProps} />);

      const input = screen.getByLabelText("Nazwa zestawu");
      await userEvent.type(input, "a".repeat(101));
      await userEvent.click(screen.getByRole("button", { name: /utwórz zestaw/i }));

      expect(screen.getByText("Nazwa zestawu nie może być dłuższa niż 100 znaków")).toBeInTheDocument();
      expect(defaultProps.onCardSetAdded).not.toHaveBeenCalled();
    });
  });

  // Testy dla niezalogowanych użytkowników (localStorage)
  describe("Local storage functionality", () => {
    it("tworzy lokalny zestaw dla niezalogowanego użytkownika", async () => {
      render(<NewCardSetModal {...defaultProps} />);

      const input = screen.getByLabelText("Nazwa zestawu");
      await userEvent.type(input, "Mój lokalny zestaw");
      await userEvent.click(screen.getByRole("button", { name: /utwórz zestaw/i }));

      expect(mockCreateCardSet).toHaveBeenCalledWith("Mój lokalny zestaw");
      expect(defaultProps.onCardSetAdded).toHaveBeenCalled();
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  // Testy dla zalogowanych użytkowników (API)
  describe("API functionality", () => {
    it("tworzy zestaw poprzez API dla zalogowanego użytkownika", async () => {
      const mockResponse = {
        id: "api-123",
        name: "Mój zestaw API",
        cards: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      render(<NewCardSetModal {...defaultProps} isAuthenticated={true} />);

      const input = screen.getByLabelText("Nazwa zestawu");
      await userEvent.type(input, "Mój zestaw API");
      await userEvent.click(screen.getByRole("button", { name: /utwórz zestaw/i }));

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/card-sets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "Mój zestaw API" }),
        });
      });

      expect(defaultProps.onCardSetAdded).toHaveBeenCalledWith(mockResponse);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it("obsługuje błędy API", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: "Błąd serwera" }),
      });

      render(<NewCardSetModal {...defaultProps} isAuthenticated={true} />);

      const input = screen.getByLabelText("Nazwa zestawu");
      await userEvent.type(input, "Mój zestaw API");
      await userEvent.click(screen.getByRole("button", { name: /utwórz zestaw/i }));

      await waitFor(() => {
        expect(screen.getByText("Błąd serwera")).toBeInTheDocument();
      });

      expect(defaultProps.onCardSetAdded).not.toHaveBeenCalled();
      expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
  });

  // Testy stanu ładowania
  describe("Loading state", () => {
    it("dezaktywuje przyciski podczas ładowania", async () => {
      mockFetch.mockImplementationOnce(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<NewCardSetModal {...defaultProps} isAuthenticated={true} />);

      const input = screen.getByLabelText("Nazwa zestawu");
      await userEvent.type(input, "Test");
      await userEvent.click(screen.getByRole("button", { name: /utwórz zestaw/i }));

      expect(screen.getByRole("button", { name: /tworzenie/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /anuluj/i })).toBeDisabled();
    });
  });
});
