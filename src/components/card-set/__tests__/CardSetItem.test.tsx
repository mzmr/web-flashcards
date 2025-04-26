import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardSetItem } from "../CardSetItem";
import { formatDate } from "@/lib/utils";
import type { CardSetDTO, Timestamp } from "@/types";

// Mock utils
vi.mock("@/lib/utils", () => ({
  formatDate: vi.fn((date: Timestamp) => `Sformatowana data: ${date}`),
  cn: (...inputs: unknown[]) => inputs.filter(Boolean).join(" "),
}));

describe("CardSetItem", () => {
  // Przykładowe dane testowe
  const mockCardSet: CardSetDTO = {
    id: "1",
    name: "Test Card Set",
    created_at: "2024-03-20T12:00:00Z" as Timestamp,
    updated_at: "2024-03-21T12:00:00Z" as Timestamp,
    isLocal: false,
  };

  const mockHref = "/card-sets/1";

  // Arrange - funkcja pomocnicza do renderowania komponentu
  const renderCardSetItem = (cardSet = mockCardSet, href = mockHref) => {
    return render(<CardSetItem cardSet={cardSet} href={href} />);
  };

  it("renderuje nazwę zestawu kart", () => {
    // Arrange
    renderCardSetItem();

    // Act & Assert
    expect(screen.getByText("Test Card Set")).toBeInTheDocument();
  });

  it("renderuje link z poprawnym href", () => {
    // Arrange
    renderCardSetItem();

    // Act
    const link = screen.getByRole("link");

    // Assert
    expect(link).toHaveAttribute("href", mockHref);
  });

  it('wyświetla badge "Lokalny" tylko dla lokalnych zestawów', () => {
    // Arrange
    const localCardSet: CardSetDTO = { ...mockCardSet, isLocal: true };

    // Act
    renderCardSetItem(localCardSet);

    // Assert
    expect(screen.getByText("Lokalny")).toBeInTheDocument();
  });

  it('nie wyświetla badge "Lokalny" dla nielokalnych zestawów', () => {
    // Arrange
    renderCardSetItem();

    // Assert
    expect(screen.queryByText("Lokalny")).not.toBeInTheDocument();
  });

  it("wyświetla sformatowaną datę ostatniej modyfikacji", () => {
    // Arrange
    renderCardSetItem();

    // Act & Assert
    expect(screen.getByText(`Ostatnia modyfikacja: Sformatowana data: ${mockCardSet.updated_at}`)).toBeInTheDocument();
    expect(formatDate).toHaveBeenCalledWith(mockCardSet.updated_at);
  });

  it("stosuje odpowiednie style hover", () => {
    // Arrange
    renderCardSetItem();

    // Act
    const card = screen.getByTestId(`card-set-${mockCardSet.id}`);

    // Assert
    expect(card).toHaveClass("hover:bg-accent/50", "transition-colors", "h-full");
  });
});
