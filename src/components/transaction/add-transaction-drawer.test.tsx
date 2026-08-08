import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import AddTransactionDrawer from "./add-transaction-drawer";

vi.mock("./transaction-form", () => ({
  default: ({ onCloseDrawer }: { onCloseDrawer?: () => void }) => (
    <div>
      <span>Transaction Form</span>
      <button onClick={onCloseDrawer}>Close Form</button>
    </div>
  ),
}));

describe("AddTransactionDrawer", () => {
  it("is closed until the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<AddTransactionDrawer />);

    expect(screen.queryByText("Transaction Form")).not.toBeInTheDocument();

    await user.click(screen.getByText("Add Transaction"));
    expect(screen.getByText("Transaction Form")).toBeInTheDocument();
    expect(screen.getByText("Add a new transaction to track your finances")).toBeInTheDocument();
  });

  it("closes when the form reports onCloseDrawer", async () => {
    const user = userEvent.setup();
    render(<AddTransactionDrawer />);

    await user.click(screen.getByText("Add Transaction"));
    await user.click(screen.getByText("Close Form"));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-state", "closed");
  });
});
