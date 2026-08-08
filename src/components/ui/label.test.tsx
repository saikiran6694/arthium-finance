import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Label } from "./label";

describe("Label", () => {
  it("renders its children and merges custom classes", () => {
    render(<Label className="custom">Email</Label>);
    const el = screen.getByText("Email");
    expect(el).toHaveClass("custom");
    expect(el).toHaveAttribute("data-slot", "label");
  });
});
