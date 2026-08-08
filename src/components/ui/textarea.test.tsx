import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
  it("renders and forwards props", () => {
    render(<Textarea placeholder="notes" className="custom" />);
    const el = screen.getByPlaceholderText("notes");
    expect(el).toHaveAttribute("data-slot", "textarea");
    expect(el).toHaveClass("custom");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Textarea placeholder="notes" />);
    const el = screen.getByPlaceholderText("notes");
    await user.type(el, "hello");
    expect(el).toHaveValue("hello");
  });
});
