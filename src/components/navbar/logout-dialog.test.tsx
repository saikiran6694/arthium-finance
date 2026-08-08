import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  authenticatedState,
  renderWithProviders,
} from "@/test/test-utils";
import LogoutDialog from "./logout-dialog";

describe("LogoutDialog", () => {
  it("renders nothing visible when closed", () => {
    renderWithProviders(
      <LogoutDialog isOpen={false} setIsOpen={vi.fn()} />
    );
    expect(
      screen.queryByText("Are you sure you want to log out?")
    ).not.toBeInTheDocument();
  });

  it("shows the confirmation copy when open", () => {
    renderWithProviders(<LogoutDialog isOpen setIsOpen={vi.fn()} />);
    expect(
      screen.getByText("Are you sure you want to log out?")
    ).toBeInTheDocument();
  });

  it("logs out, closes the dialog, and navigates to sign-in on confirm", async () => {
    const user = userEvent.setup();
    const setIsOpen = vi.fn();
    const { store } = renderWithProviders(
      <LogoutDialog isOpen setIsOpen={setIsOpen} />,
      { preloadedState: authenticatedState, route: "/overview" }
    );

    await user.click(screen.getByText("Yes"));

    expect(setIsOpen).toHaveBeenCalledWith(false);
    expect(store.getState().auth.access_token).toBeNull();
  });
});
