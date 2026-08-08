import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Footer from "./index";

describe("Footer", () => {
  it("renders a footer element", () => {
    const { container } = render(<Footer />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
