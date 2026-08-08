import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { authenticatedState, renderWithProviders } from "@/test/test-utils";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import Sidebar from "./sidebar";

describe("Sidebar", () => {
  it("renders the expanded state with labels and highlights the active route", () => {
    renderWithProviders(<Sidebar isCollapsed={false} onToggle={vi.fn()} />, {
      preloadedState: authenticatedState,
      route: PROTECTED_ROUTES.TRANSACTIONS,
    });

    expect(screen.getByText("Arthium")).toBeInTheDocument();
    expect(screen.getByText("Transactions")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders the collapsed state without labels", () => {
    renderWithProviders(<Sidebar isCollapsed onToggle={vi.fn()} />, {
      preloadedState: authenticatedState,
      route: PROTECTED_ROUTES.OVERVIEW,
    });

    expect(screen.queryByText("Arthium")).not.toBeInTheDocument();
  });

  it("calls onToggle when the collapse button is clicked", () => {
    const onToggle = vi.fn();
    renderWithProviders(<Sidebar isCollapsed={false} onToggle={onToggle} />, {
      preloadedState: authenticatedState,
    });

    fireEvent.click(screen.getByLabelText("Collapse sidebar"));
    expect(onToggle).toHaveBeenCalled();
  });

  it("shows the expand label when collapsed", () => {
    renderWithProviders(<Sidebar isCollapsed onToggle={vi.fn()} />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByLabelText("Expand sidebar")).toBeInTheDocument();
  });

  it("falls back to a 'U' avatar initial and 'User' label when unauthenticated", () => {
    renderWithProviders(<Sidebar isCollapsed={false} onToggle={vi.fn()} />);
    expect(screen.getByText("U")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
  });

  it("shows the user's initial and name when authenticated", () => {
    renderWithProviders(<Sidebar isCollapsed={false} onToggle={vi.fn()} />, {
      preloadedState: authenticatedState,
    });
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });

  it("opens the logout confirmation dialog from the profile button", () => {
    renderWithProviders(<Sidebar isCollapsed={false} onToggle={vi.fn()} />, {
      preloadedState: authenticatedState,
    });

    fireEvent.click(screen.getByLabelText("Logout"));
    expect(
      screen.getByText("Are you sure you want to log out?")
    ).toBeInTheDocument();
  });

  it("marks a nested transaction route as active via startsWith matching", () => {
    renderWithProviders(<Sidebar isCollapsed={false} onToggle={vi.fn()} />, {
      preloadedState: authenticatedState,
      route: `${PROTECTED_ROUTES.TRANSACTIONS}/123`,
    });

    expect(screen.getByText("Transactions").closest("a")).toHaveClass(
      "text-white"
    );
  });
});
