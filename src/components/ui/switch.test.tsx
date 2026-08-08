import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

describe("Switch", () => {
  it("toggles state on click and calls onCheckedChange", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Switch onCheckedChange={onCheckedChange} />);

    const el = screen.getByRole("switch");
    expect(el).toHaveAttribute("data-state", "unchecked");

    await user.click(el);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("renders as checked when controlled", () => {
    render(<Switch checked />);
    expect(screen.getByRole("switch")).toHaveAttribute("data-state", "checked");
  });
});
