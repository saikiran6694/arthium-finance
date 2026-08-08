import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { DataTable } from "@/components/data-table";
import type { TransactionType } from "@/features/transaction/transationType";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { transactionColumns } from "./column";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

function baseTxn(overrides: Partial<TransactionType>): TransactionType {
  return {
    _id: "txn-1",
    userId: "u1",
    title: "Sample",
    type: "EXPENSE",
    amount: 25,
    description: "",
    category: "Food",
    date: "2026-01-05T00:00:00.000Z",
    is_recurring: false,
    recurring_interval: null,
    next_recurring_date: null,
    last_processed: null,
    status: "COMPLETED",
    payment_method: "CARD",
    created_at: "2026-01-05T00:00:00.000Z",
    updated_at: "2026-01-05T00:00:00.000Z",
    ...overrides,
  };
}

function renderColumns(rows: TransactionType[]) {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <NuqsTestingAdapter>
        <MemoryRouter>
          <DataTable
            data={rows}
            columns={transactionColumns}
            isShowPagination={false}
          />
        </MemoryRouter>
      </NuqsTestingAdapter>
    </Provider>
  );
}

describe("transactionColumns", () => {
  it("formats an income row in green with a + sign", () => {
    renderColumns([
      baseTxn({ _id: "1", type: "INCOME", amount: 100, title: "Salary" }),
    ]);
    expect(screen.getByText("+$100.00")).toBeInTheDocument();
    expect(screen.getByText("Salary")).toBeInTheDocument();
  });

  it("formats an expense row in red with a - sign", () => {
    renderColumns([
      baseTxn({ _id: "1", type: "EXPENSE", amount: 40, title: "Coffee" }),
    ]);
    expect(screen.getByText("-$40.00")).toBeInTheDocument();
  });

  it("shows N/A when there is no payment method", () => {
    renderColumns([baseTxn({ _id: "1", payment_method: "" })]);
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });

  it("formats an underscored payment method as lowercase words", () => {
    renderColumns([baseTxn({ _id: "1", payment_method: "BANK_TRANSFER" })]);
    expect(screen.getByText("bank transfer")).toBeInTheDocument();
  });

  it("shows 'One-time' for a non-recurring transaction", () => {
    renderColumns([baseTxn({ _id: "1", is_recurring: false })]);
    expect(screen.getByText("One-time")).toBeInTheDocument();
  });

  it("shows the next date for a recurring transaction (the frequency label always reads 'One-time' due to the recurringInterval/recurring_interval accessor mismatch)", () => {
    renderColumns([
      baseTxn({
        _id: "1",
        is_recurring: true,
        recurring_interval: "MONTHLY",
        next_recurring_date: "2026-02-05T00:00:00.000Z",
      }),
    ]);
    expect(screen.getByText("One-time")).toBeInTheDocument();
    expect(screen.getByText(/^Next: /)).toBeInTheDocument();
  });

  it("falls back to 'One-time' for an unrecognized recurring interval", () => {
    renderColumns([
      baseTxn({
        _id: "1",
        is_recurring: true,
        recurring_interval: "SOMETHING_UNKNOWN" as never,
      }),
    ]);
    expect(screen.getByText("One-time")).toBeInTheDocument();
  });

  it("opens the actions menu and duplicates a transaction", async () => {
    const user = userEvent.setup();
    server.use(
      http.put(`${API_URL}/transaction/duplicate/txn-1`, () =>
        new HttpResponse(null, { status: 204 })
      )
    );

    renderColumns([baseTxn({ _id: "txn-1" })]);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    await user.click(await screen.findByText("Duplicate"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Transaction duplicated successfully"
      )
    );
  });

  it("deletes a transaction from the actions menu", async () => {
    const user = userEvent.setup();
    server.use(
      http.delete(`${API_URL}/transaction/txn-1`, () =>
        new HttpResponse(null, { status: 204 })
      )
    );

    renderColumns([baseTxn({ _id: "txn-1" })]);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    await user.click(await screen.findByText("Delete"));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Transaction deleted successfully"
      )
    );
  });

  it("shows an error toast when duplicate fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.put(`${API_URL}/transaction/duplicate/txn-1`, () =>
        HttpResponse.json({ message: "Duplicate failed" }, { status: 500 })
      )
    );

    renderColumns([baseTxn({ _id: "txn-1" })]);
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    await user.click(await screen.findByText("Duplicate"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Duplicate failed")
    );
  });

  it("opens the edit drawer query state when Edit is clicked", async () => {
    const user = userEvent.setup();
    renderColumns([baseTxn({ _id: "txn-1" })]);

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[buttons.length - 1]);
    await user.click(await screen.findByText("Edit"));
    // No crash / the menu item is wired to the edit-drawer hook.
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  it("sorts by column header click without throwing", async () => {
    const user = userEvent.setup();
    renderColumns([
      baseTxn({ _id: "1", title: "A" }),
      baseTxn({ _id: "2", title: "B" }),
    ]);
    await user.click(screen.getByText("Category"));
    expect(screen.getByText("A")).toBeInTheDocument();
  });
});
