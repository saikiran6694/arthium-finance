import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Progress } from "./progress";

describe("Progress", () => {
  it("translates the indicator based on the given value", () => {
    const { container } = render(<Progress value={40} />);
    const indicator = container.querySelector(
      '[data-slot="progress-indicator"]'
    ) as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(-60%)");
  });

  it("defaults to 0 when no value is given", () => {
    const { container } = render(<Progress />);
    const indicator = container.querySelector(
      '[data-slot="progress-indicator"]'
    ) as HTMLElement;
    expect(indicator.style.transform).toBe("translateX(-100%)");
  });
});
