import { act, renderHook } from "@testing-library/react";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { describe, expect, it } from "vitest";
import useEditTransactionDrawer from "./use-edit-transaction-drawer";

describe("useEditTransactionDrawer", () => {
  it("defaults to closed with no transaction selected", () => {
    const { result } = renderHook(() => useEditTransactionDrawer(), {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(result.current.open).toBe(false);
    expect(result.current.transactionId).toBe("");
  });

  it("onOpenDrawer sets the transaction id and opens the drawer", () => {
    const { result } = renderHook(() => useEditTransactionDrawer(), {
      wrapper: withNuqsTestingAdapter(),
    });

    act(() => {
      result.current.onOpenDrawer("txn-123");
    });

    expect(result.current.open).toBe(true);
    expect(result.current.transactionId).toBe("txn-123");
  });

  it("onCloseDrawer clears the transaction id and closes the drawer", () => {
    const { result } = renderHook(() => useEditTransactionDrawer(), {
      wrapper: withNuqsTestingAdapter({
        searchParams: "?edit=true&transactionId=txn-123",
      }),
    });

    expect(result.current.open).toBe(true);
    expect(result.current.transactionId).toBe("txn-123");

    act(() => {
      result.current.onCloseDrawer();
    });

    expect(result.current.open).toBe(false);
    expect(result.current.transactionId).toBe("");
  });
});
