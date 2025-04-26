import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CardSetList } from "../CardSetList";
import type { CardSetDTO } from "@/types";

// Mock CardSetItem component to isolate tests
vi.mock("../CardSetItem", () => ({
  CardSetItem: ({ cardSet, href }: { cardSet: CardSetDTO; href: string }) => (
    <div data-testid="card-set-item" data-card-set-id={cardSet.id} data-href={href}>
      {cardSet.name}
    </div>
  ),
}));

describe("CardSetList", () => {
  // Przykładowe dane testowe
  const mockCardSets: CardSetDTO[] = [
    {
      id: "1",
      name: "Zestaw 1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Zestaw 2",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  describe("gdy lista jest pusta", () => {
    it("wyświetla komunikat o braku zestawów", () => {
      // Arrange
      const emptyCardSets: CardSetDTO[] = [];

      // Act
      render(<CardSetList cardSets={emptyCardSets} />);

      // Assert
      expect(screen.getByText("Nie masz jeszcze żadnych zestawów fiszek.")).toBeInTheDocument();
      expect(screen.getByText('Kliknij przycisk "Nowy zestaw" aby utworzyć pierwszy zestaw.')).toBeInTheDocument();
    });
  });

  describe("gdy lista zawiera zestawy", () => {
    it("renderuje wszystkie zestawy fiszek", () => {
      // Arrange
      render(<CardSetList cardSets={mockCardSets} />);

      // Act
      const cardSetItems = screen.getAllByTestId("card-set-item");

      // Assert
      expect(cardSetItems).toHaveLength(mockCardSets.length);
      mockCardSets.forEach((cardSet) => {
        const item = screen.getByText(cardSet.name);
        expect(item).toBeInTheDocument();
      });
    });

    it("przekazuje poprawne props do komponentów CardSetItem", () => {
      // Arrange
      render(<CardSetList cardSets={mockCardSets} />);

      // Act
      const cardSetItems = screen.getAllByTestId("card-set-item");

      // Assert
      cardSetItems.forEach((item, index) => {
        expect(item).toHaveAttribute("data-card-set-id", mockCardSets[index].id);
        expect(item).toHaveAttribute("data-href", `/card-sets/${mockCardSets[index].id}`);
      });
    });

    it("renderuje grid z odpowiednimi klasami responsywności", () => {
      // Arrange
      render(<CardSetList cardSets={mockCardSets} />);

      // Act
      const gridContainer = screen.getByTestId("card-set-grid");

      // Assert
      expect(gridContainer).toHaveClass("grid", "md:grid-cols-2", "lg:grid-cols-3");
    });
  });
});
