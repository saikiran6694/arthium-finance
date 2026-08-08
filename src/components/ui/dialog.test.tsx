import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

function Example() {
  return (
    <Dialog>
      <DialogTrigger>Open</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone.")).toBeInTheDocument();
  });

  it("closes when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(<Example />);

    await user.click(screen.getByText("Open"));
    await user.click(screen.getByText("Cancel"));

    expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();
  });

  it("supports an uncontrolled default-open state", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>Default open</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText("Default open")).toBeInTheDocument();
  });
});
