import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { CardSetDetailsPage } from "../CardSetDetailsPage";
import { useCardSetDetails } from "../hooks/useCardSetDetails";
import type { CardSetDetailDTO, CardSource } from "@/types";
import { redirectTo } from "@/lib/api/helpers";
import { type Card } from "../../types";

// Mockowanie modułów
vi.mock("../hooks/useCardSetDetails", () => ({
  useCardSetDetails: vi.fn(),
}));

vi.mock("@/lib/api/helpers", () => ({
  redirectTo: vi.fn(),
}));

vi.mock("../card/DeleteCardDialog", () => ({
  DeleteCardDialog: ({ isOpen, onDelete }: { isOpen: boolean; onDelete: () => void }) => {
    if (!isOpen) return null;
    return (
      <div role="dialog">
        <button onClick={onDelete}>Potwierdź usunięcie</button>
      </div>
    );
  },
}));

vi.mock("../card/EditCardDialog", () => ({
  EditCardDialog: ({ isOpen, onSave }: { isOpen: boolean; onSave: (card: Card) => void }) => {
    if (!isOpen) return null;
    return (
      <div role="dialog">
        <input aria-label="przód" />
        <input aria-label="tył" />
        <button
          onClick={() =>
            onSave({
              front: "Nowy przód",
              back: "Nowy tył",
            } as Card)
          }
        >
          Zapisz zmiany
        </button>
      </div>
    );
  },
}));

describe("CardSetDetailsPage", () => {
  const mockCardSet: CardSetDetailDTO = {
    id: "test-id",
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

  const mockHookReturn = {
    isLoading: false,
    error: null,
    cardSet: mockCardSet,
    filteredCards: mockCardSet.cards,
    searchTerm: "",
    isSaving: false,
    setSearchTerm: vi.fn(),
    updateCardSetName: vi.fn(),
    deleteCardSet: vi.fn(),
    updateCard: vi.fn(),
    deleteCard: vi.fn(),
    saveToCloud: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockHookReturn);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // Test renderowania stanu ładowania
  it("powinien wyświetlić spinner podczas ładowania", () => {
    // Arrange
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      isLoading: true,
    });

    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Assert
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  // Test renderowania błędu
  it("powinien wyświetlić komunikat błędu", () => {
    // Arrange
    const errorMessage = "Wystąpił błąd podczas ładowania zestawu";
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      error: errorMessage,
    });

    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Assert
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  // Test renderowania pustego stanu
  it("nie powinien nic renderować gdy cardSet jest null", () => {
    // Arrange
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      cardSet: null,
    });

    // Act
    const { container } = render(<CardSetDetailsPage cardSetId="test-id" />);

    // Assert
    expect(container.firstChild).toBeNull();
  });

  // Test renderowania głównego widoku
  it("powinien poprawnie wyrenderować główny widok zestawu kart", () => {
    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Assert
    expect(screen.getByText("Test Set")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  // Test wyszukiwania kart
  it("powinien obsłużyć wyszukiwanie kart", async () => {
    // Arrange
    const user = userEvent.setup();
    const setSearchTermMock = vi.fn();
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      setSearchTerm: setSearchTermMock,
      filteredCards: [mockCardSet.cards[0]], // Symulujemy przefiltrowane karty
    });

    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Act
    const searchInput = screen.getByPlaceholderText(/szukaj/i);
    await user.type(searchInput, "Front 1");

    // Assert
    await waitFor(() => {
      expect(setSearchTermMock).toHaveBeenCalledTimes(7); // "Front 1" ma 7 znaków
      expect(setSearchTermMock.mock.calls).toEqual([["F"], ["r"], ["o"], ["n"], ["t"], [" "], ["1"]]);
      expect(screen.getByText("Front 1")).toBeInTheDocument();
      expect(screen.queryByText("Front 2")).not.toBeInTheDocument();
    });
  });

  // Test filtrowania kart
  it("powinien wyświetlić przefiltrowane karty", () => {
    // Arrange
    const filteredCards = [mockCardSet.cards[0]];
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      filteredCards,
    });

    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Assert
    const cards = screen.getAllByRole("listitem");
    expect(cards).toHaveLength(1);
    expect(screen.getByText("Front 1")).toBeInTheDocument();
    expect(screen.queryByText("Front 2")).not.toBeInTheDocument();
  });

  // Test użycia cardSet.cards gdy filteredCards jest undefined
  it("powinien użyć cardSet.cards gdy filteredCards jest undefined", () => {
    // Arrange
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      filteredCards: undefined,
    });

    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Assert
    const cards = screen.getAllByRole("listitem");
    expect(cards).toHaveLength(2);
    expect(screen.getByText("Front 1")).toBeInTheDocument();
    expect(screen.getByText("Front 2")).toBeInTheDocument();
  });

  // Test zapisywania do chmury
  it("powinien obsłużyć zapisywanie do chmury", async () => {
    // Arrange
    const user = userEvent.setup();
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      cardSet: { ...mockCardSet, isLocal: true },
    });

    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);
    const saveButton = screen.getByRole("button", { name: /zapisz w chmurze/i });
    await user.click(saveButton);

    // Assert
    await waitFor(() => {
      expect(mockHookReturn.saveToCloud).toHaveBeenCalled();
    });
  });

  // Test aktualizacji nazwy zestawu
  it("powinien obsłużyć aktualizację nazwy zestawu", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Act
    const editButton = screen.getByLabelText("Edytuj nazwę");
    await user.click(editButton);

    // Teraz dialog powinien być otwarty
    const nameInput = screen.getByRole("textbox");
    await user.clear(nameInput);
    await user.type(nameInput, "Nowa nazwa");

    const saveButton = screen.getByRole("button", { name: /zapisz/i });
    await user.click(saveButton);

    // Assert
    await waitFor(() => {
      expect(mockHookReturn.updateCardSetName).toHaveBeenCalledWith("Nowa nazwa");
    });
  });

  // Test usuwania karty
  it("powinien obsłużyć usuwanie karty", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Klikamy przycisk usuwania
    const deleteButton = screen.getAllByLabelText(/usuń kartę/i)[0];
    await user.click(deleteButton);

    // Klikamy przycisk potwierdzenia w dialogu
    const confirmButton = screen.getByText(/potwierdź usunięcie/i);
    await user.click(confirmButton);

    // Assert
    await waitFor(() => {
      expect(mockHookReturn.deleteCard).toHaveBeenCalledWith("card-1");
    });
  });

  // Test aktualizacji karty
  it("powinien aktualizować kartę po kliknięciu przycisku edycji", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Act
    const editButton = screen.getAllByRole("button", { name: /edytuj kartę/i })[0];
    await user.click(editButton);

    // Wprowadź nowe dane
    const frontInput = screen.getByLabelText(/przód/i);
    const backInput = screen.getByLabelText(/tył/i);
    await user.clear(frontInput);
    await user.clear(backInput);
    await user.type(frontInput, "Nowy przód");
    await user.type(backInput, "Nowy tył");

    // Zapisz zmiany
    const saveButton = screen.getByRole("button", { name: /zapisz zmiany/i });
    await user.click(saveButton);

    // Assert
    await waitFor(() => {
      expect(mockHookReturn.updateCard).toHaveBeenCalledWith("card-1", {
        front: "Nowy przód",
        back: "Nowy tył",
      });
    });
  });

  // Test stanu zapisywania
  it("powinien wyświetlić stan zapisywania", () => {
    // Arrange
    (useCardSetDetails as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      ...mockHookReturn,
      isSaving: true,
      cardSet: { ...mockCardSet, isLocal: true },
    });

    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);

    // Assert
    expect(screen.getByLabelText(/zapisywanie/i)).toBeInTheDocument();
  });

  // Test nawigacji powrotu
  it("powinien obsłużyć nawigację powrotu", async () => {
    // Arrange
    const user = userEvent.setup();
    render(<CardSetDetailsPage cardSetId="test-id" />);
    const backButton = screen.getByRole("button", { name: /powrót/i });

    // Act
    await user.click(backButton);

    // Assert
    await waitFor(() => {
      expect(redirectTo).toHaveBeenCalledWith("/card-sets");
    });
  });

  // Test responsywności
  it("powinien zachować responsywny układ", () => {
    // Act
    render(<CardSetDetailsPage cardSetId="test-id" />);
    const container = screen.getByTestId("card-set-details");

    // Assert
    expect(container).toHaveClass("container", "mx-auto", "px-4", "py-8", "max-w-7xl");
  });
});
