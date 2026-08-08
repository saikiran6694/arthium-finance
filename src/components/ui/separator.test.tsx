import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "./separator";

describe("Separator", () => {
  it("renders horizontally and decorative by default", () => {
    const { container } = render(<Separator />);
    const el = container.querySelector('[data-slot="separator-root"]');
    expect(el).toHaveAttribute("data-orientation", "horizontal");
    expect(el).toHaveAttribute("role", "none");
  });

  it("renders vertically when requested", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.querySelector('[data-slot="separator-root"]');
    expect(el).toHaveAttribute("data-orientation", "vertical");
  });

  it("exposes a separator role when not decorative", () => {
    const { container } = render(<Separator decorative={false} />);
    const el = container.querySelector('[data-slot="separator-root"]');
    expect(el).toHaveAttribute("role", "separator");
  });
});
