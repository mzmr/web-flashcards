import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CardSetHeader } from "../CardSetHeader";
import { redirectTo } from "@/lib/api/helpers";

// Mock redirectTo helper
vi.mock("@/lib/api/helpers", () => ({
  redirectTo: vi.fn(),
}));

describe("CardSetHeader", () => {
  // Przygotowanie wspólnych danych testowych
  const mockCardSet = {
    id: "1",
    name: "Test Card Set",
    description: "Test Description",
    cards: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isLocal: true, // Dodajemy tę właściwość, aby przycisk zapisu był widoczny
  };

  const defaultProps = {
    cardSet: mockCardSet,
    onUpdateName: vi.fn(),
    onDelete: vi.fn(),
    onSaveToCloud: vi.fn(),
    isSaving: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("powinien wyrenderować podstawowe elementy", () => {
      render(<CardSetHeader {...defaultProps} />);

      expect(screen.getByText(mockCardSet.name)).toBeInTheDocument();
      expect(screen.getByText("Dodaj fiszki")).toBeInTheDocument();
    });

    it("powinien wyświetlać przycisk zapisu do chmury", () => {
      render(<CardSetHeader {...defaultProps} />);

      expect(screen.getByRole("button", { name: /zapisz w chmurze/i })).toBeInTheDocument();
    });

    it("nie powinien wyświetlać przycisku zapisu do chmury dla zestawu z chmury", () => {
      const cloudCardSet = { ...mockCardSet, isLocal: false };
      render(<CardSetHeader {...defaultProps} cardSet={cloudCardSet} />);

      expect(screen.queryByRole("button", { name: /zapisz w chmurze/i })).not.toBeInTheDocument();
    });
  });

  describe("Edycja nazwy", () => {
    it("powinien otworzyć dialog edycji po kliknięciu przycisku edycji", async () => {
      const user = userEvent.setup();
      render(<CardSetHeader {...defaultProps} />);

      const editButton = screen.getByRole("button", { name: /edytuj nazwę/i });
      await user.click(editButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByRole("textbox")).toHaveValue(mockCardSet.name);
    });

    it("powinien zaktualizować nazwę po zatwierdzeniu", async () => {
      const user = userEvent.setup();
      const newName = "Updated Card Set Name";
      render(<CardSetHeader {...defaultProps} />);

      // Otwórz dialog
      await user.click(screen.getByRole("button", { name: /edytuj nazwę/i }));

      // Wprowadź nową nazwę
      const input = screen.getByRole("textbox");
      await user.clear(input);
      await user.type(input, newName);

      // Zatwierdź zmiany
      await user.click(screen.getByRole("button", { name: /zapisz/i }));

      expect(defaultProps.onUpdateName).toHaveBeenCalledWith(newName);
    });

    it("nie powinien aktualizować nazwy gdy nowa nazwa jest pusta", async () => {
      const user = userEvent.setup();
      render(<CardSetHeader {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /edytuj nazwę/i }));

      const input = screen.getByRole("textbox");
      await user.clear(input);

      const saveButton = screen.getByRole("button", { name: /zapisz/i });
      expect(saveButton).toBeDisabled();

      await user.click(saveButton);
      expect(defaultProps.onUpdateName).not.toHaveBeenCalled();
    });
  });

  describe("Usuwanie zestawu", () => {
    it("powinien wyświetlić dialog potwierdzenia przed usunięciem", async () => {
      const user = userEvent.setup();
      render(<CardSetHeader {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /usuń zestaw/i }));

      expect(screen.getByText(/czy na pewno chcesz usunąć/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /usuń/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /anuluj/i })).toBeInTheDocument();
    });

    it("powinien wywołać onDelete po potwierdzeniu usunięcia", async () => {
      const user = userEvent.setup();
      render(<CardSetHeader {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /usuń zestaw/i }));
      await user.click(screen.getByRole("button", { name: /usuń/i }));

      expect(defaultProps.onDelete).toHaveBeenCalled();
    });
  });

  describe("Nawigacja", () => {
    it("powinien przekierować do listy zestawów po kliknięciu przycisku powrotu", async () => {
      const user = userEvent.setup();
      render(<CardSetHeader {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /powrót/i }));

      expect(redirectTo).toHaveBeenCalledWith("/card-sets");
    });

    it("powinien przekierować do dodawania fiszek po kliknięciu przycisku dodawania", async () => {
      const user = userEvent.setup();
      render(<CardSetHeader {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: "Dodaj fiszki" }));

      expect(redirectTo).toHaveBeenCalledWith(`/card-sets/${mockCardSet.id}/add-cards`);
    });
  });

  describe("Obsługa stanów ładowania", () => {
    it("powinien wyświetlać stan ładowania podczas zapisywania nazwy", async () => {
      const user = userEvent.setup();
      defaultProps.onUpdateName.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<CardSetHeader {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /edytuj nazwę/i }));
      await user.clear(screen.getByRole("textbox"));
      await user.type(screen.getByRole("textbox"), "New Name");
      await user.click(screen.getByRole("button", { name: /zapisz/i }));

      expect(screen.getByText("Zapisywanie...")).toBeInTheDocument();
    });

    it("powinien wyświetlać stan ładowania podczas usuwania", async () => {
      const user = userEvent.setup();
      defaultProps.onDelete.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

      render(<CardSetHeader {...defaultProps} />);

      await user.click(screen.getByRole("button", { name: /usuń zestaw/i }));
      await user.click(screen.getByRole("button", { name: /usuń/i }));

      expect(screen.getByText("Usuwanie...")).toBeInTheDocument();
    });
  });
});
