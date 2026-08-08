import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { Provider } from "react-redux";
import { describe, expect, it, vi } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import TransactionForm from "./transaction-form";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from "sonner";

vi.mock("./reciept-scanner", () => ({
  default: ({
    onScanComplete,
  }: {
    onScanComplete: (data: {
      title: string;
      amount: number;
      date: string;
      description: string;
      category: string;
      payment_method: string;
      type: string;
      receipt_url: string;
    }) => void;
  }) => (
    <button
      onClick={() =>
        onScanComplete({
          title: "Scanned Coffee",
          amount: 12.5,
          date: "2026-01-05",
          description: "From receipt",
          category: "food",
          payment_method: "CARD",
          type: "EXPENSE",
          receipt_url: "https://example.com/receipt.png",
        })
      }
    >
      Simulate Scan
    </button>
  ),
}));

const API_URL = import.meta.env.VITE_API_URL;

function renderForm(props: Partial<Parameters<typeof TransactionForm>[0]> = {}) {
  const store = createTestStore();
  return { store, ...render(
    <Provider store={store}>
      <TransactionForm {...props} />
    </Provider>
  ) };
}

async function fillRequiredFields(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("Transaction title"), "Groceries");
  await user.type(screen.getByPlaceholderText("$0.00"), "50");

  await user.click(screen.getByPlaceholderText("Select or type a category"));
  await user.click(await screen.findByText("Groceries"));

  // fireEvent avoids a jsdom pointer-event race with the just-closed category popover.
  // Query by position: the category combobox (cmdk input) is first, payment method is last.
  const comboboxes = screen.getAllByRole("combobox");
  fireEvent.click(comboboxes[comboboxes.length - 1]);
  fireEvent.click(await screen.findByRole("option", { name: "Cash" }));
}

describe("TransactionForm", () => {
  it("renders the receipt scanner and defaults to Income in create mode", () => {
    renderForm();
    expect(screen.getByText("Simulate Scan")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Income" })).toHaveAttribute(
      "data-state",
      "checked"
    );
    expect(screen.getByText("Save")).toBeInTheDocument();
  });

  it("hides the receipt scanner in edit mode", () => {
    renderForm({ isEdit: true, transactionId: "txn-1" });
    expect(screen.queryByText("Simulate Scan")).not.toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByText("Save"));

    expect(
      await screen.findByText("Title must be at least 2 characters.")
    ).toBeInTheDocument();
    expect(screen.getByText("Please select a category.")).toBeInTheDocument();
    expect(
      screen.getByText("Please select a payment method.")
    ).toBeInTheDocument();
  });

  it("populates the form from the fetched transaction in edit mode", async () => {
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, () =>
        HttpResponse.json({
          _id: "txn-1",
          userId: "u1",
          title: "Rent",
          type: "EXPENSE",
          amount: 1200,
          description: "Monthly rent",
          category: "housing",
          date: "2026-01-01T00:00:00.000Z",
          is_recurring: true,
          recurring_interval: "MONTHLY",
          next_recurring_date: null,
          last_processed: null,
          status: "COMPLETED",
          payment_method: "BANK_TRANSFER",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        })
      )
    );

    renderForm({ isEdit: true, transactionId: "txn-1" });

    expect(await screen.findByDisplayValue("Rent")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Monthly rent")).toBeInTheDocument();
  });

  it("shows a loading overlay while fetching the transaction to edit", () => {
    const { container } = renderForm({ isEdit: true, transactionId: "txn-1" });
    expect(container.querySelector(".animate-spin")).toBeInTheDocument();
  });

  it("toggles the frequency field when recurring is enabled and clears it when disabled", async () => {
    const user = userEvent.setup();
    renderForm();

    expect(screen.queryByText("Frequency")).not.toBeInTheDocument();

    await user.click(screen.getByRole("switch"));
    expect(screen.getByText("Frequency")).toBeInTheDocument();
    expect(screen.getByText("This will repeat automatically")).toBeInTheDocument();

    await user.click(screen.getByRole("switch"));
    expect(screen.queryByText("Frequency")).not.toBeInTheDocument();
  });

  it("selects the Expense transaction type", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole("radio", { name: "Expense" }));
    expect(screen.getByRole("radio", { name: "Expense" })).toHaveAttribute(
      "data-state",
      "checked"
    );
  });

  it("applies scanned receipt data to the form", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByText("Simulate Scan"));

    expect(screen.getByDisplayValue("Scanned Coffee")).toBeInTheDocument();
    expect(screen.getByDisplayValue("From receipt")).toBeInTheDocument();
  });

  it("creates a transaction and closes the drawer on success", async () => {
    const user = userEvent.setup();
    let received: unknown;
    server.use(
      http.post(`${API_URL}/transaction/create`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 201 });
      })
    );

    const onCloseDrawer = vi.fn();
    renderForm({ onCloseDrawer });

    await fillRequiredFields(user);
    await user.click(screen.getByText("Save"));

    await waitFor(() => expect(onCloseDrawer).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Transaction created successfully"
    );
    expect(received).toMatchObject({ title: "Groceries", amount: 50 });
  });

  it("shows an error toast when creating a transaction fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.post(`${API_URL}/transaction/create`, () =>
        HttpResponse.json({ message: "Server exploded" }, { status: 500 })
      )
    );

    renderForm();
    await fillRequiredFields(user);
    await user.click(screen.getByText("Save"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Server exploded")
    );
  });

  it("updates a transaction and closes the drawer on success", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, () =>
        HttpResponse.json({
          _id: "txn-1",
          userId: "u1",
          title: "Rent",
          type: "EXPENSE",
          amount: 1200,
          description: "Monthly rent",
          category: "housing",
          date: "2026-01-01T00:00:00.000Z",
          is_recurring: false,
          recurring_interval: null,
          next_recurring_date: null,
          last_processed: null,
          status: "COMPLETED",
          payment_method: "BANK_TRANSFER",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        })
      ),
      http.put(`${API_URL}/transaction/txn-1`, () => new HttpResponse(null, { status: 204 }))
    );

    const onCloseDrawer = vi.fn();
    renderForm({ isEdit: true, transactionId: "txn-1", onCloseDrawer });

    await screen.findByDisplayValue("Rent");
    await user.click(screen.getByText("Update"));

    await waitFor(() => expect(onCloseDrawer).toHaveBeenCalled());
    expect(toast.success).toHaveBeenCalledWith(
      "Transaction updated successfully"
    );
  });

  it("shows an error toast when updating a transaction fails", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, () =>
        HttpResponse.json({
          _id: "txn-1",
          userId: "u1",
          title: "Rent",
          type: "EXPENSE",
          amount: 1200,
          description: "Monthly rent",
          category: "housing",
          date: "2026-01-01T00:00:00.000Z",
          is_recurring: false,
          recurring_interval: null,
          next_recurring_date: null,
          last_processed: null,
          status: "COMPLETED",
          payment_method: "BANK_TRANSFER",
          created_at: "2026-01-01",
          updated_at: "2026-01-01",
        })
      ),
      http.put(`${API_URL}/transaction/txn-1`, () =>
        HttpResponse.json({ message: "Update failed" }, { status: 500 })
      )
    );

    renderForm({ isEdit: true, transactionId: "txn-1" });

    await screen.findByDisplayValue("Rent");
    await user.click(screen.getByText("Update"));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Update failed")
    );
  });
});
