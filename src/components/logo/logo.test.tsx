import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import Logo from "./logo";

describe("Logo", () => {
  it("links to the overview route by default", () => {
    render(
      <MemoryRouter>
        <Logo />
      </MemoryRouter>
    );
    expect(screen.getByText("Arthium").closest("a")).toHaveAttribute(
      "href",
      PROTECTED_ROUTES.OVERVIEW
    );
  });

  it("links to a custom url when provided", () => {
    render(
      <MemoryRouter>
        <Logo url="/custom" />
      </MemoryRouter>
    );
    expect(screen.getByText("Arthium").closest("a")).toHaveAttribute(
      "href",
      "/custom"
    );
  });
});
