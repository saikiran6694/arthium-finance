import { act, renderHook } from "@testing-library/react";
import type { PropsWithChildren } from "react";
import { Provider } from "react-redux";
import { describe, expect, it } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { setCredentials } from "@/features/auth/authSlice";
import { useAppDispatch, useTypedSelector } from "./hook";

describe("app hooks", () => {
  it("useTypedSelector reads from the store and useAppDispatch dispatches actions", () => {
    const store = createTestStore();
    const wrapper = ({ children }: PropsWithChildren) => (
      <Provider store={store}>{children}</Provider>
    );

    const { result } = renderHook(
      () => ({
        auth: useTypedSelector((state) => state.auth),
        dispatch: useAppDispatch(),
      }),
      { wrapper }
    );

    expect(result.current.auth.access_token).toBeNull();

    act(() => {
      result.current.dispatch(
        setCredentials({
          access_token: "token",
          expires_in: 1000,
          refresh_token: "refresh",
          user: null,
          report_settings: null,
        })
      );
    });

    expect(store.getState().auth.access_token).toBe("token");
  });
});
