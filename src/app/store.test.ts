import { describe, expect, it } from "vitest";
import { logout } from "@/features/auth/authSlice";
import { apiClient } from "./api-client";
import { persistor, store } from "./store";

describe("store", () => {
  it("wires up the auth and api reducers", () => {
    const state = store.getState();
    expect(state).toHaveProperty("auth");
    expect(state).toHaveProperty(apiClient.reducerPath);
  });

  it("dispatches actions through the persisted root reducer", () => {
    store.dispatch(logout());
    expect(store.getState().auth.access_token).toBeNull();
  });

  it("creates a persistor linked to the store", () => {
    expect(persistor).toBeDefined();
    expect(typeof persistor.flush).toBe("function");
    expect(typeof persistor.purge).toBe("function");
  });
});
