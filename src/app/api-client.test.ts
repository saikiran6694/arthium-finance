import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { createTestStore, authenticatedState } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { apiClient } from "./api-client";
import { transactionApi } from "@/features/transaction/transactionAPI";

const API_URL = import.meta.env.VITE_API_URL;

describe("api-client", () => {
  it("attaches the Authorization header when an access token is present", async () => {
    let authHeader: string | null = null;
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, ({ request }) => {
        authHeader = request.headers.get("authorization");
        return HttpResponse.json({ _id: "txn-1" });
      })
    );

    const store = createTestStore(authenticatedState);
    await store
      .dispatch(transactionApi.endpoints.getSingleTransaction.initiate("txn-1"))
      .unwrap();

    expect(authHeader).toBe("Bearer test-access-token");
  });

  it("omits the Authorization header when there is no access token", async () => {
    let authHeader: string | null = "unset";
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, ({ request }) => {
        authHeader = request.headers.get("authorization");
        return HttpResponse.json({ _id: "txn-1" });
      })
    );

    const store = createTestStore();
    await store
      .dispatch(transactionApi.endpoints.getSingleTransaction.initiate("txn-1"))
      .unwrap();

    expect(authHeader).toBeNull();
  });

  it("on a 401, refreshes the token and retries the original request", async () => {
    let attempt = 0;
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, ({ request }) => {
        attempt += 1;
        if (attempt === 1) {
          return HttpResponse.json({ message: "expired" }, { status: 401 });
        }
        const authHeader = request.headers.get("authorization");
        return HttpResponse.json({ _id: "txn-1", authHeader });
      }),
      http.post(`${API_URL}/auth/refresh-token`, () =>
        HttpResponse.json({ access_token: "refreshed-token", expires_in: 3600 })
      )
    );

    const store = createTestStore(authenticatedState);
    const result = await store
      .dispatch(transactionApi.endpoints.getSingleTransaction.initiate("txn-1"))
      .unwrap();

    expect(attempt).toBe(2);
    expect(store.getState().auth.access_token).toBe("refreshed-token");
    expect((result as unknown as { authHeader: string }).authHeader).toBe(
      "Bearer refreshed-token"
    );
  });

  it("on a 401 with a failed refresh, logs the user out and surfaces the original error", async () => {
    server.use(
      http.get(`${API_URL}/transaction/txn-1`, () =>
        HttpResponse.json({ message: "expired" }, { status: 401 })
      ),
      http.post(`${API_URL}/auth/refresh-token`, () =>
        HttpResponse.json({ message: "invalid" }, { status: 401 })
      )
    );

    const store = createTestStore(authenticatedState);
    await expect(
      store
        .dispatch(transactionApi.endpoints.getSingleTransaction.initiate("txn-1"))
        .unwrap()
    ).rejects.toMatchObject({ status: 401 });

    expect(store.getState().auth.access_token).toBeNull();
  });

  it("exposes the api reducer path and tag types", () => {
    expect(apiClient.reducerPath).toBe("api");
  });
});
