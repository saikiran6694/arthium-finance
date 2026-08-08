import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RadioGroup, RadioGroupItem } from "./radio-group";

describe("RadioGroup", () => {
  it("selects an item on click and calls onValueChange", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <RadioGroup onValueChange={onValueChange}>
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>
    );

    await user.click(screen.getByLabelText("Option B"));
    expect(onValueChange).toHaveBeenCalledWith("b");
  });

  it("reflects the controlled value", () => {
    render(
      <RadioGroup value="a">
        <RadioGroupItem value="a" aria-label="Option A" />
        <RadioGroupItem value="b" aria-label="Option B" />
      </RadioGroup>
    );

    expect(screen.getByLabelText("Option A")).toHaveAttribute(
      "data-state",
      "checked"
    );
    expect(screen.getByLabelText("Option B")).toHaveAttribute(
      "data-state",
      "unchecked"
    );
  });
});
