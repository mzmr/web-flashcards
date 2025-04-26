import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardSetSummary } from "../CardSetSummary";

describe("CardSetSummary", () => {
  // Arrange-Act-Assert pattern dla każdego testu

  it("wyświetla komunikat o braku zestawów gdy total wynosi 0", () => {
    // Arrange
    render(<CardSetSummary total={0} />);

    // Act & Assert
    expect(screen.getByText("Brak zestawów fiszek")).toBeInTheDocument();
  });

  it("wyświetla poprawną formę dla 1 zestawu", () => {
    // Arrange
    render(<CardSetSummary total={1} />);

    // Act & Assert
    expect(screen.getByText("1 zestaw fiszek")).toBeInTheDocument();
  });

  it("wyświetla poprawną formę dla 2-4 zestawów", () => {
    // Arrange
    const testCases = [2, 3, 4];

    testCases.forEach((total) => {
      // Act
      const { rerender } = render(<CardSetSummary total={total} />);

      // Assert
      expect(screen.getByText(`${total} zestawy fiszek`)).toBeInTheDocument();

      // Cleanup przed następnym przypadkiem
      rerender(<></>);
    });
  });

  it("wyświetla poprawną formę dla 5 i więcej zestawów", () => {
    // Arrange
    const testCases = [5, 10, 20, 100];

    testCases.forEach((total) => {
      // Act
      const { rerender } = render(<CardSetSummary total={total} />);

      // Assert
      expect(screen.getByText(`${total} zestawów fiszek`)).toBeInTheDocument();

      // Cleanup przed następnym przypadkiem
      rerender(<></>);
    });
  });

  it("renderuje się z odpowiednimi klasami stylów", () => {
    // Arrange
    render(<CardSetSummary total={1} />);

    // Act
    const container = screen.getByText("1 zestaw fiszek").parentElement;

    // Assert
    expect(container).toHaveClass("text-lg", "font-medium");
  });
});
