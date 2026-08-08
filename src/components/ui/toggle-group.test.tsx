import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToggleGroup, ToggleGroupItem } from "./toggle-group";

describe("ToggleGroup", () => {
  it("selects an item and reports the value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup type="single" onValueChange={onValueChange}>
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
        <ToggleGroupItem value="italic">Italic</ToggleGroupItem>
      </ToggleGroup>
    );

    await user.click(screen.getByText("Bold"));
    expect(onValueChange).toHaveBeenCalledWith("bold");
  });

  it("propagates variant/size context to items when items don't set their own", () => {
    render(
      <ToggleGroup type="single" variant="outline" size="lg">
        <ToggleGroupItem value="bold">Bold</ToggleGroupItem>
      </ToggleGroup>
    );

    const item = screen.getByText("Bold");
    expect(item).toHaveAttribute("data-variant", "outline");
    expect(item).toHaveAttribute("data-size", "lg");
  });

  it("lets an item override the group's variant/size when the group leaves them unset", () => {
    render(
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold" variant="outline" size="sm">
          Bold
        </ToggleGroupItem>
      </ToggleGroup>
    );

    const item = screen.getByText("Bold");
    expect(item).toHaveAttribute("data-variant", "outline");
    expect(item).toHaveAttribute("data-size", "sm");
  });
});
