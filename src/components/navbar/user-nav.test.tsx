import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { UserNav } from "./user-nav";

describe("UserNav", () => {
  it("shows the first letter of the user's name as the avatar fallback", () => {
    render(
      <UserNav userName="Jane Doe" profilePicture="" onLogout={vi.fn()} />
    );
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("opens the dropdown and calls onLogout when Log out is clicked", async () => {
    const user = userEvent.setup();
    const onLogout = vi.fn();
    render(
      <UserNav userName="Jane Doe" profilePicture="" onLogout={onLogout} />
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Log out"));

    expect(onLogout).toHaveBeenCalled();
  });

  it("shows the user's name in the dropdown label", async () => {
    const user = userEvent.setup();
    render(
      <UserNav userName="Jane Doe" profilePicture="" onLogout={vi.fn()} />
    );
    await user.click(screen.getByRole("button"));
    expect(screen.getAllByText("Jane Doe")).not.toHaveLength(0);
  });
});
