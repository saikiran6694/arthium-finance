import { renderHook, waitFor } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { logout } from "@/features/auth/authSlice";
import useAuthExpiration from "./use-auth-expiration";

const API_URL = import.meta.env.VITE_API_URL;

function buildWrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useAuthExpiration", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does nothing when there is no active session", () => {
    const store = createTestStore();
    const { result } = renderHook(() => useAuthExpiration(), {
      wrapper: buildWrapper(store),
    });

    expect(result.current).toBeUndefined();
    expect(store.getState().auth.access_token).toBeNull();
  });

  it("refreshes the token shortly before it expires", async () => {
    server.use(
      http.post(`${API_URL}/auth/refresh-token`, () =>
        HttpResponse.json({ access_token: "new-token", expires_in: 60000 })
      )
    );

    const store = createTestStore({
      auth: {
        access_token: "old-token",
        expires_at: Date.now() + 61000,
        refresh_token: "refresh-token",
        user: null,
        reportSetting: null,
      },
    });

    renderHook(() => useAuthExpiration(), { wrapper: buildWrapper(store) });

    await vi.advanceTimersByTimeAsync(2000);

    await waitFor(() => {
      expect(store.getState().auth.access_token).toBe("new-token");
    });
  });

  it("refreshes immediately when the token is already at/past its refresh window", async () => {
    server.use(
      http.post(`${API_URL}/auth/refresh-token`, () =>
        HttpResponse.json({ access_token: "fresh-token", expires_in: 60000 })
      )
    );

    const store = createTestStore({
      auth: {
        access_token: "old-token",
        expires_at: Date.now() - 1000,
        refresh_token: "refresh-token",
        user: null,
        reportSetting: null,
      },
    });

    renderHook(() => useAuthExpiration(), { wrapper: buildWrapper(store) });

    await waitFor(() => {
      expect(store.getState().auth.access_token).toBe("fresh-token");
    });
  });

  it("logs the user out when the refresh request fails", async () => {
    server.use(
      http.post(`${API_URL}/auth/refresh-token`, () =>
        HttpResponse.json({ message: "invalid refresh token" }, { status: 401 })
      )
    );

    const store = createTestStore({
      auth: {
        access_token: "old-token",
        expires_at: Date.now() - 1000,
        refresh_token: "refresh-token",
        user: { _id: "1", name: "A", email: "a@b.com", profile_picture: "" },
        reportSetting: null,
      },
    });

    renderHook(() => useAuthExpiration(), { wrapper: buildWrapper(store) });

    await waitFor(() => {
      expect(store.getState().auth.access_token).toBeNull();
    });
  });

  it("clears the pending refresh timer on unmount", () => {
    const store = createTestStore({
      auth: {
        access_token: "old-token",
        expires_at: Date.now() + 5 * 60 * 1000,
        refresh_token: "refresh-token",
        user: null,
        reportSetting: null,
      },
    });

    const { unmount } = renderHook(() => useAuthExpiration(), {
      wrapper: buildWrapper(store),
    });

    expect(() => unmount()).not.toThrow();
    store.dispatch(logout());
  });
});
