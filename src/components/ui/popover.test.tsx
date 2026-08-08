import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "./popover";

describe("Popover", () => {
  it("opens the content when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>
    );

    expect(screen.queryByText("Popover body")).not.toBeInTheDocument();
    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Popover body")).toBeInTheDocument();
  });

  it("renders a PopoverAnchor", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverAnchor data-testid="anchor" />
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Anchored content</PopoverContent>
      </Popover>
    );
    expect(screen.getByTestId("anchor")).toBeInTheDocument();
    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Anchored content")).toBeInTheDocument();
  });
});
