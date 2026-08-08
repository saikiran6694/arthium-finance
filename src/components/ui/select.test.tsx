import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

function Example({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Pick a category" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Category</SelectLabel>
          <SelectItem value="groceries">Groceries</SelectItem>
          <SelectSeparator />
          <SelectItem value="dining">Dining</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("shows the placeholder before any selection", () => {
    render(<Example />);
    expect(screen.getByText("Pick a category")).toBeInTheDocument();
  });

  it("opens the list and selects an item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox"));
    const option = await screen.findByText("Groceries");
    await user.click(option);

    expect(onValueChange).toHaveBeenCalledWith("groceries");
  });

  it("supports a small trigger size", () => {
    render(
      <Select>
        <SelectTrigger size="sm">
          <SelectValue placeholder="x" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="a">A</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByRole("combobox")).toHaveAttribute("data-size", "sm");
  });
});
