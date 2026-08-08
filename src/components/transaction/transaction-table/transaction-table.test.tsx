import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import TransactionTable from "./index";

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL;

function renderTable(props: Partial<Parameters<typeof TransactionTable>[0]> = {}) {
  const store = createTestStore();
  return render(
    <Provider store={store}>
      <NuqsTestingAdapter>
        <MemoryRouter>
          <TransactionTable {...props} />
        </MemoryRouter>
      </NuqsTestingAdapter>
    </Provider>
  );
}

function mockTransactionsList(overrides: Record<string, unknown> = {}) {
  server.use(
    http.get(`${API_URL}/transaction/all`, () =>
      HttpResponse.json({
        message: "ok",
        transactions: [
          {
            _id: "1",
            userId: "u1",
            title: "Coffee",
            type: "EXPENSE",
            amount: 5,
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
          },
        ],
        pagination: {
          page_size: 10,
          page_number: 1,
          total_count: 1,
          total_pages: 1,
          skip: 0,
        },
        ...overrides,
      })
    )
  );
}

describe("TransactionTable", () => {
  it("fetches and displays transactions", async () => {
    mockTransactionsList();
    renderTable();
    expect(await screen.findByText("Coffee")).toBeInTheDocument();
  });

  it("passes the typed search term through to the search input", async () => {
    server.use(
      http.get(`${API_URL}/transaction/all`, () =>
        HttpResponse.json({
          message: "ok",
          transactions: [],
          pagination: { page_size: 10, page_number: 1, total_count: 0, total_pages: 0, skip: 0 },
        })
      )
    );
    const user = userEvent.setup();
    renderTable();

    const input = await screen.findByPlaceholderText("Search transactions...");
    await user.type(input, "cof");

    await waitFor(() => expect(input).toHaveValue("cof"));
  });

  it("eventually refetches with the debounced keyword", async () => {
    const keywords: (string | null)[] = [];
    server.use(
      http.get(`${API_URL}/transaction/all`, ({ request }) => {
        keywords.push(new URL(request.url).searchParams.get("keyword"));
        return HttpResponse.json({
          message: "ok",
          transactions: [],
          pagination: { page_size: 10, page_number: 1, total_count: 0, total_pages: 0, skip: 0 },
        });
      })
    );
    const user = userEvent.setup();
    renderTable();

    const input = await screen.findByPlaceholderText("Search transactions...");
    await user.type(input, "cof");
    await waitFor(() => expect(input).toHaveValue("cof"));

    await waitFor(() => expect(keywords).toContain("cof"), { timeout: 5000 });
  }, 10000);

  it("bulk deletes selected transactions", async () => {
    mockTransactionsList();
    server.use(
      http.delete(`${API_URL}/transaction/bulk-delete`, () =>
        new HttpResponse(null, { status: 204 })
      )
    );

    const user = userEvent.setup();
    renderTable();

    await screen.findByText("Coffee");
    await user.click(screen.getByLabelText("Select row"));
    await user.click(screen.getByText(/Delete \(1\)/));

    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        "Transactions deleted successfully"
      )
    );
  });

  it("respects a custom pageSize prop", async () => {
    let lastPageSize: string | null = null;
    server.use(
      http.get(`${API_URL}/transaction/all`, ({ request }) => {
        lastPageSize = new URL(request.url).searchParams.get("page_size");
        return HttpResponse.json({
          message: "ok",
          transactions: [],
          pagination: { page_size: 25, page_number: 1, total_count: 0, total_pages: 0, skip: 0 },
        });
      })
    );

    renderTable({ pageSize: 25 });
    await waitFor(() => expect(lastPageSize).toBe("25"));
  });

  it("hides pagination when isShowPagination is false", async () => {
    mockTransactionsList();
    renderTable({ isShowPagination: false });
    await screen.findByText("Coffee");
    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
  });
});
