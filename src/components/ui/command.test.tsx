import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./command";

function Example({ onSelect }: { onSelect?: () => void }) {
  return (
    <Command>
      <CommandInput placeholder="Search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Fruits">
          <CommandItem onSelect={onSelect}>
            Apple
            <CommandShortcut>⌘A</CommandShortcut>
          </CommandItem>
          <CommandItem>Banana</CommandItem>
        </CommandGroup>
        <CommandSeparator />
      </CommandList>
    </Command>
  );
}

describe("Command", () => {
  it("renders items and filters as the user types", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText("Search..."), "App");

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("Banana")).not.toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.type(screen.getByPlaceholderText("Search..."), "zzz");
    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("calls onSelect when an item is chosen", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Example onSelect={onSelect} />);

    await user.click(screen.getByText("Apple"));
    expect(onSelect).toHaveBeenCalled();
  });
});

describe("CommandDialog", () => {
  it("renders the command palette inside a dialog with default title/description", async () => {
    const user = userEvent.setup();
    render(
      <CommandDialog open>
        <CommandInput placeholder="Type a command..." />
        <CommandList>
          <CommandItem>Go to dashboard</CommandItem>
        </CommandList>
      </CommandDialog>
    );

    expect(screen.getByText("Command Palette")).toBeInTheDocument();
    expect(
      screen.getByText("Search for a command to run...")
    ).toBeInTheDocument();
    expect(screen.getByText("Go to dashboard")).toBeInTheDocument();
    await user.type(
      screen.getByPlaceholderText("Type a command..."),
      "dash"
    );
  });

  it("accepts a custom title and description", () => {
    render(
      <CommandDialog open title="Quick actions" description="Pick one">
        <CommandList>
          <CommandItem>Item</CommandItem>
        </CommandList>
      </CommandDialog>
    );

    expect(screen.getByText("Quick actions")).toBeInTheDocument();
    expect(screen.getByText("Pick one")).toBeInTheDocument();
  });
});
