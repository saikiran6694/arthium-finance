import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "./dropdown-menu";

function Example({
  onSelectItem,
  onCheckedChange,
  onRadioChange,
}: {
  onSelectItem?: () => void;
  onCheckedChange?: (v: boolean) => void;
  onRadioChange?: (v: string) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>Open menu</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onSelect={onSelectItem}>
          Edit
          <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={false}
          onCheckedChange={onCheckedChange}
        >
          Show archived
        </DropdownMenuCheckboxItem>
        <DropdownMenuRadioGroup value="a" onValueChange={onRadioChange}>
          <DropdownMenuRadioItem value="a">Option A</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="b">Option B</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Nested action</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens the menu and shows items", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    await user.click(screen.getByText("Open menu"));

    expect(screen.getByText("Edit")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();
    expect(screen.getByText("⌘E")).toBeInTheDocument();
  });

  it("calls onSelect when an item is clicked", async () => {
    const user = userEvent.setup();
    const onSelectItem = vi.fn();
    render(<Example onSelectItem={onSelectItem} />);

    await user.click(screen.getByText("Open menu"));
    await user.click(screen.getByText("Edit"));

    expect(onSelectItem).toHaveBeenCalled();
  });

  it("toggles a checkbox item", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(<Example onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByText("Open menu"));
    await user.click(screen.getByText("Show archived"));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("selects a radio item", async () => {
    const user = userEvent.setup();
    const onRadioChange = vi.fn();
    render(<Example onRadioChange={onRadioChange} />);

    await user.click(screen.getByText("Open menu"));
    await user.click(screen.getByText("Option B"));

    expect(onRadioChange).toHaveBeenCalledWith("b");
  });
});
