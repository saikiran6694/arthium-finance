import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Alert, AlertDescription, AlertTitle } from "./alert";

describe("Alert", () => {
  it("renders with role alert and the default variant", () => {
    render(
      <Alert>
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Something happened</AlertDescription>
      </Alert>
    );

    const el = screen.getByRole("alert");
    expect(el.className).toContain("bg-card");
    expect(screen.getByText("Heads up")).toHaveAttribute(
      "data-slot",
      "alert-title"
    );
    expect(screen.getByText("Something happened")).toHaveAttribute(
      "data-slot",
      "alert-description"
    );
  });

  it("applies the destructive variant", () => {
    render(<Alert variant="destructive">Danger</Alert>);
    expect(screen.getByRole("alert").className).toContain("text-destructive");
  });
});
