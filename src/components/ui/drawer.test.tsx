import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";

function Example() {
  return (
    <Drawer>
      <DrawerTrigger>Open</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit item</DrawerTitle>
          <DrawerDescription>Update the item details</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter>
          <DrawerClose>Close</DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<Example />);

    expect(screen.queryByText("Edit item")).not.toBeInTheDocument();

    await user.click(screen.getByText("Open"));
    expect(screen.getByText("Edit item")).toBeInTheDocument();
    expect(screen.getByText("Update the item details")).toBeInTheDocument();
  });

  it("supports a controlled open state", () => {
    render(
      <Drawer open direction="right">
        <DrawerContent>
          <DrawerTitle>Controlled</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );

    expect(screen.getByText("Controlled")).toBeInTheDocument();
  });
});
