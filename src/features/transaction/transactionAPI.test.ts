import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { transactionApi } from "./transactionAPI";

const API_URL = import.meta.env.VITE_API_URL;

const createBody = {
  title: "Groceries",
  type: "EXPENSE" as const,
  amount: 50,
  description: "Weekly groceries",
  category: "Food",
  date: "2026-08-01",
  is_recurring: false,
  payment_method: "CARD",
};

describe("transactionApi", () => {
  it("createTransaction POSTs to /transaction/create", async () => {
    let received: unknown;
    server.use(
      http.post(`${API_URL}/transaction/create`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 201 });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(transactionApi.endpoints.createTransaction.initiate(createBody))
      .unwrap();

    expect(received).toEqual(createBody);
  });

  it("aiScanReceipt POSTs form data to /transaction/scan-receipt", async () => {
    server.use(
      http.post(`${API_URL}/transaction/scan-receipt`, () =>
        HttpResponse.json({
          title: "Coffee",
          amount: 5,
          date: "2026-08-01",
          description: "Coffee",
          category: "Food",
          payment_method: "CARD",
          type: "EXPENSE",
          receipt_url: "https://example.com/receipt.png",
        })
      )
    );

    const formData = new FormData();
    formData.append("file", new Blob(["data"]), "receipt.png");

    const store = createTestStore();
    const result = await store
      .dispatch(transactionApi.endpoints.aiScanReceipt.initiate(formData))
      .unwrap();

    expect(result.title).toBe("Coffee");
  });

  it("getAllTransactions GETs /transaction/all with the provided params", async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${API_URL}/transaction/all`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json({
          message: "ok",
          transactions: [],
          pagination: {
            page_size: 10,
            page_number: 1,
            total_count: 0,
            total_pages: 0,
            skip: 0,
          },
        });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        transactionApi.endpoints.getAllTransactions.initiate({
          keyword: "coffee",
          type: "EXPENSE",
          recurring_status: "RECURRING",
          page_number: 2,
          page_size: 25,
        })
      )
      .unwrap();

    expect(receivedUrl?.searchParams.get("keyword")).toBe("coffee");
    expect(receivedUrl?.searchParams.get("type")).toBe("EXPENSE");
    expect(receivedUrl?.searchParams.get("recurring_status")).toBe("RECURRING");
    expect(receivedUrl?.searchParams.get("page_number")).toBe("2");
    expect(receivedUrl?.searchParams.get("page_size")).toBe("25");
  });

  it("getAllTransactions defaults page_number to 1 and page_size to 10 when omitted", async () => {
    let receivedUrl: URL | undefined;
    server.use(
      http.get(`${API_URL}/transaction/all`, ({ request }) => {
        receivedUrl = new URL(request.url);
        return HttpResponse.json({
          message: "ok",
          transactions: [],
          pagination: {
            page_size: 10,
            page_number: 1,
            total_count: 0,
            total_pages: 0,
            skip: 0,
          },
        });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(transactionApi.endpoints.getAllTransactions.initiate({}))
      .unwrap();

    expect(receivedUrl?.searchParams.get("page_number")).toBe("1");
    expect(receivedUrl?.searchParams.get("page_size")).toBe("10");
    expect(receivedUrl?.searchParams.get("keyword")).toBeNull();
  });

  it("getSingleTransaction GETs /transaction/:id", async () => {
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, () =>
        HttpResponse.json({
          _id: "txn-1",
          userId: "u1",
          title: "Coffee",
          type: "EXPENSE",
          amount: 5,
          description: "Coffee",
          category: "Food",
          date: "2026-08-01",
          is_recurring: false,
          recurring_interval: null,
          next_recurring_date: null,
          last_processed: null,
          status: "COMPLETED",
          payment_method: "CARD",
          created_at: "2026-08-01",
          updated_at: "2026-08-01",
        })
      )
    );

    const store = createTestStore();
    const result = await store
      .dispatch(transactionApi.endpoints.getSingleTransaction.initiate("txn-1"))
      .unwrap();

    expect(result._id).toBe("txn-1");
  });

  it("duplicateTransaction PUTs /transaction/duplicate/:id", async () => {
    server.use(
      http.put(`${API_URL}/transaction/duplicate/txn-1`, () =>
        new HttpResponse(null, { status: 204 })
      )
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(transactionApi.endpoints.duplicateTransaction.initiate("txn-1"))
        .unwrap()
    ).resolves.toBeNull();
  });

  it("updateTransaction PUTs /transaction/:id with the transaction body", async () => {
    let received: unknown;
    server.use(
      http.put(`${API_URL}/transaction/txn-1`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        transactionApi.endpoints.updateTransaction.initiate({
          id: "txn-1",
          transaction: createBody,
        })
      )
      .unwrap();

    expect(received).toEqual(createBody);
  });

  it("bulkImportTransaction POSTs /transaction/bulk-transaction", async () => {
    const payload = {
      transactions: [
        {
          title: "Coffee",
          type: "EXPENSE" as const,
          amount: 5,
          category: "Food",
          description: "Coffee",
          date: "2026-08-01",
          payment_method: "CARD" as const,
          is_recurring: false,
        },
      ],
    };
    let received: unknown;
    server.use(
      http.post(`${API_URL}/transaction/bulk-transaction`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 201 });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(transactionApi.endpoints.bulkImportTransaction.initiate(payload))
      .unwrap();

    expect(received).toEqual(payload);
  });

  it("deleteTransaction DELETEs /transaction/:id", async () => {
    server.use(
      http.delete(`${API_URL}/transaction/txn-1`, () =>
        new HttpResponse(null, { status: 204 })
      )
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(transactionApi.endpoints.deleteTransaction.initiate("txn-1"))
        .unwrap()
    ).resolves.toBeNull();
  });

  it("bulkDeleteTransaction DELETEs /transaction/bulk-delete with the id list", async () => {
    let received: unknown;
    server.use(
      http.delete(`${API_URL}/transaction/bulk-delete`, async ({ request }) => {
        received = await request.json();
        return new HttpResponse(null, { status: 204 });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(
        transactionApi.endpoints.bulkDeleteTransaction.initiate([
          "txn-1",
          "txn-2",
        ])
      )
      .unwrap();

    expect(received).toEqual(["txn-1", "txn-2"]);
  });
});
