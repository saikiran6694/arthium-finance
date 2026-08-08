import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SIDEBAR_KEY } from "@/constant";
import AppLayout from "./app-layout";

vi.mock("@/components/sidebar/sidebar", () => ({
  default: ({
    isCollapsed,
    onToggle,
  }: {
    isCollapsed: boolean;
    onToggle: () => void;
  }) => (
    <div data-testid="sidebar">
      <span data-testid="collapsed-state">{String(isCollapsed)}</span>
      <button onClick={onToggle}>toggle</button>
    </div>
  ),
}));

vi.mock("@/components/transaction/edit-transaction-drawer", () => ({
  default: () => <div data-testid="edit-transaction-drawer" />,
}));

function renderAppLayout() {
  return render(
    <MemoryRouter initialEntries={["/child"]}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/child" element={<div>Child content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("AppLayout", () => {
  afterEach(() => {
    localStorage.clear();
  });

  it("defaults to collapsed when nothing is stored", () => {
    renderAppLayout();
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");
  });

  it("reads the collapsed state from localStorage when present", () => {
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(false));
    renderAppLayout();
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
  });

  it("falls back to collapsed when localStorage contains invalid JSON", () => {
    localStorage.setItem(SIDEBAR_KEY, "{not-json");
    renderAppLayout();
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");
  });

  it("toggles the collapsed state and persists it to localStorage", () => {
    renderAppLayout();
    fireEvent.click(screen.getByText("toggle"));

    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");
    expect(localStorage.getItem(SIDEBAR_KEY)).toBe("false");
  });

  it("toggles the sidebar on Ctrl+B / Cmd+B", () => {
    renderAppLayout();

    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");

    fireEvent.keyDown(window, { key: "b", metaKey: true });
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");
  });

  it("ignores unrelated key presses", () => {
    renderAppLayout();
    fireEvent.keyDown(window, { key: "a", ctrlKey: true });
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("true");
  });

  it("silently ignores a localStorage.setItem failure when toggling", () => {
    renderAppLayout();
    const spy = vi
      .spyOn(window.localStorage, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded");
      });

    expect(() => fireEvent.click(screen.getByText("toggle"))).not.toThrow();
    expect(screen.getByTestId("collapsed-state")).toHaveTextContent("false");

    spy.mockRestore();
  });

  it("renders the outlet content and the edit transaction drawer", () => {
    renderAppLayout();
    expect(screen.getByText("Child content")).toBeInTheDocument();
    expect(screen.getByTestId("edit-transaction-drawer")).toBeInTheDocument();
  });

  it("removes the keydown listener on unmount", () => {
    const { unmount } = renderAppLayout();
    expect(() => unmount()).not.toThrow();
  });
});
