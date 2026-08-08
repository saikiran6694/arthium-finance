import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonVariants } from "./button";

describe("Button", () => {
  it("renders as a button by default and handles clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Save</Button>);

    const el = screen.getByRole("button", { name: "Save" });
    expect(el).toHaveAttribute("data-slot", "button");
    await user.click(el);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    );
    const el = screen.getByRole("button", { name: "Delete" });
    expect(el.className).toContain("bg-destructive");
    expect(el.className).toContain("h-10");
  });

  it("does not fire onClick when disabled", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Disabled
      </Button>
    );
    await user.click(screen.getByRole("button", { name: "Disabled" }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("renders as the child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/somewhere">Go</a>
      </Button>
    );
    const el = screen.getByText("Go");
    expect(el.tagName).toBe("A");
  });

  it("exposes buttonVariants for external use", () => {
    expect(buttonVariants({ variant: "ghost", size: "icon" })).toContain(
      "size-9"
    );
  });
});
