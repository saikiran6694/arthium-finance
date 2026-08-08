import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
  it("renders with the given type and forwards props", () => {
    render(<Input type="email" placeholder="you@example.com" />);
    const el = screen.getByPlaceholderText("you@example.com");
    expect(el).toHaveAttribute("type", "email");
    expect(el).toHaveAttribute("data-slot", "input");
  });

  it("accepts user input", async () => {
    const user = userEvent.setup();
    render(<Input placeholder="name" />);
    const el = screen.getByPlaceholderText("name");
    await user.type(el, "Jane");
    expect(el).toHaveValue("Jane");
  });

  it("merges a custom className", () => {
    render(<Input className="custom-class" placeholder="x" />);
    expect(screen.getByPlaceholderText("x")).toHaveClass("custom-class");
  });
});
