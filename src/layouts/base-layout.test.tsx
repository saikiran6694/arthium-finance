import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import BaseLayout from "./base-layout";

describe("BaseLayout", () => {
  it("renders the matched child route via Outlet", () => {
    render(
      <MemoryRouter initialEntries={["/child"]}>
        <Routes>
          <Route element={<BaseLayout />}>
            <Route path="/child" element={<div>Child content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Child content")).toBeInTheDocument();
  });
});
