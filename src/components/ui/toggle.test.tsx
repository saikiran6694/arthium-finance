import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Toggle, toggleVariants } from "./toggle";

describe("Toggle", () => {
  it("toggles the pressed state on click", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>);

    const el = screen.getByRole("button", { name: "Bold" });
    expect(el).toHaveAttribute("data-state", "off");

    await user.click(el);
    expect(onPressedChange).toHaveBeenCalledWith(true);
  });

  it("applies variant and size classes", () => {
    render(
      <Toggle variant="outline" size="sm">
        Italic
      </Toggle>
    );
    expect(screen.getByRole("button").className).toContain("border");
  });

  it("exposes toggleVariants for external use", () => {
    expect(toggleVariants({ size: "lg" })).toContain("h-10");
  });
});
