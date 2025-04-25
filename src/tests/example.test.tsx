import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Przykładowy test", () => {
  it("powinien przechodzić", () => {
    expect(true).toBe(true);
  });

  it("powinien renderować element", () => {
    render(<div data-testid="test-element">Test</div>);
    expect(screen.getByTestId("test-element")).toBeInTheDocument();
    expect(screen.getByText("Test")).toBeVisible();
  });
});
