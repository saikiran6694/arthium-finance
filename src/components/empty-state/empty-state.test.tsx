import { render, screen } from "@testing-library/react";
import { PackageOpen } from "lucide-react";
import { describe, expect, it } from "vitest";
import { EmptyState } from "./index";

describe("EmptyState", () => {
  it("renders the title and description with a default icon", () => {
    const { container } = render(
      <EmptyState title="Nothing here" description="Try adding an item" />
    );
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
    expect(screen.getByText("Try adding an item")).toBeInTheDocument();
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders a custom icon when provided", () => {
    const { container } = render(
      <EmptyState
        title="Nothing here"
        description="Try adding an item"
        icon={PackageOpen}
      />
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("applies a custom className", () => {
    const { container } = render(
      <EmptyState
        title="Nothing here"
        description="Try adding an item"
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });
});
