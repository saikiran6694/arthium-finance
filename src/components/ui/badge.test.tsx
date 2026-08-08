import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, badgeVariants } from "./badge";

describe("Badge", () => {
  it("renders as a span by default with the default variant", () => {
    render(<Badge>New</Badge>);
    const el = screen.getByText("New");
    expect(el.tagName).toBe("SPAN");
    expect(el).toHaveAttribute("data-slot", "badge");
    expect(el.className).toContain("bg-primary");
  });

  it("applies the requested variant", () => {
    render(<Badge variant="destructive">Danger</Badge>);
    expect(screen.getByText("Danger").className).toContain("bg-destructive");
  });

  it("renders as the child element when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/somewhere">Link badge</a>
      </Badge>
    );
    const el = screen.getByText("Link badge");
    expect(el.tagName).toBe("A");
    expect(el).toHaveAttribute("href", "/somewhere");
  });

  it("exposes badgeVariants for external use", () => {
    expect(badgeVariants({ variant: "outline" })).toContain("text-foreground");
  });
});
