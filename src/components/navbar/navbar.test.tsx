import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { authenticatedState, renderWithProviders } from "@/test/test-utils";
import { PROTECTED_ROUTES } from "@/routes/common/routePath";
import Navbar from "./index";

describe("Navbar", () => {
  it("renders the nav links and highlights the active route", () => {
    renderWithProviders(<Navbar />, {
      preloadedState: authenticatedState,
      route: PROTECTED_ROUTES.OVERVIEW,
    });

    expect(screen.getAllByText("Overview").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Transactions").length).toBeGreaterThan(0);
  });

  it("shows the user's initial from the authenticated user", () => {
    renderWithProviders(<Navbar />, {
      preloadedState: authenticatedState,
      route: PROTECTED_ROUTES.OVERVIEW,
    });
    expect(screen.getByText("T")).toBeInTheDocument();
  });

  it("opens the mobile navigation sheet from the menu button", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, {
      preloadedState: authenticatedState,
      route: PROTECTED_ROUTES.OVERVIEW,
    });

    const menuButtons = screen.getAllByRole("button");
    await user.click(menuButtons[0]);

    expect(screen.getAllByText("Settings").length).toBeGreaterThan(0);
  });

  it("keeps the logout dialog closed until requested", () => {
    renderWithProviders(<Navbar />, {
      preloadedState: authenticatedState,
      route: PROTECTED_ROUTES.OVERVIEW,
    });

    expect(
      screen.queryByText("Are you sure you want to log out?")
    ).not.toBeInTheDocument();
  });

  it("opens the user menu showing the logout option", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Navbar />, {
      preloadedState: authenticatedState,
      route: PROTECTED_ROUTES.OVERVIEW,
    });

    await user.click(screen.getByText("T"));
    expect(await screen.findByText("Log out")).toBeInTheDocument();
  });
});
