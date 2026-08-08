import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton } from "./skeleton";

describe("Skeleton", () => {
  it("renders with the base pulse styling and merges custom classes", () => {
    const { container } = render(<Skeleton className="h-4 w-4" />);
    const el = container.querySelector('[data-slot="skeleton"]');
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("animate-pulse", "h-4", "w-4");
  });
});
