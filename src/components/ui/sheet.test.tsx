import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

function Example({ side }: { side?: "top" | "right" | "bottom" | "left" }) {
  return (
    <Sheet>
      <SheetTrigger>Open</SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Sheet title</SheetTitle>
          <SheetDescription>Sheet description</SheetDescription>
        </SheetHeader>
        <SheetFooter>
          <SheetClose>Close Sheet</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

describe("Sheet", () => {
  it("is closed until the trigger is clicked and closes via the close action", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.queryByText("Sheet title")).not.toBeInTheDocument();

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Sheet title")).toBeInTheDocument();

    await user.click(screen.getByText("Close Sheet"));
    expect(screen.queryByText("Sheet title")).not.toBeInTheDocument();
  });

  it.each(["top", "right", "bottom", "left"] as const)(
    "renders the %s side variant",
    async (side) => {
      const user = userEvent.setup();
      render(<Example side={side} />);
      await user.click(screen.getByText("Open"));
      expect(screen.getByText("Sheet title")).toBeInTheDocument();
    }
  );
});
