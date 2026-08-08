import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useDebouncedSearch from "./use-debounce-search";

describe("useDebouncedSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("initializes searchTerm and debouncedTerm with the initial value", () => {
    const { result } = renderHook(() => useDebouncedSearch("initial"));
    expect(result.current.searchTerm).toBe("initial");
    expect(result.current.debouncedTerm).toBe("initial");
  });

  it("updates searchTerm immediately but debounces debouncedTerm by the default delay", () => {
    const { result } = renderHook(() => useDebouncedSearch(""));

    act(() => {
      result.current.setSearchTerm("hello");
    });

    expect(result.current.searchTerm).toBe("hello");
    expect(result.current.debouncedTerm).toBe("");

    act(() => {
      vi.advanceTimersByTime(499);
    });
    expect(result.current.debouncedTerm).toBe("");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.debouncedTerm).toBe("hello");
  });

  it("respects a custom delay", () => {
    const { result } = renderHook(() =>
      useDebouncedSearch("", { delay: 1000 })
    );

    act(() => {
      result.current.setSearchTerm("hi");
    });

    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current.debouncedTerm).toBe("");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.debouncedTerm).toBe("hi");
  });

  it("clears the pending timer on unmount without throwing", () => {
    const { result, unmount } = renderHook(() => useDebouncedSearch(""));

    act(() => {
      result.current.setSearchTerm("hi");
    });

    expect(() => unmount()).not.toThrow();
  });

  it("syncs debouncedTerm immediately (bypassing the delay) when the term returns to the initial value", () => {
    const { result } = renderHook(() =>
      useDebouncedSearch("initial", { immediate: true, delay: 1000 })
    );

    act(() => {
      result.current.setSearchTerm("changed");
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.debouncedTerm).toBe("changed");

    act(() => {
      result.current.setSearchTerm("initial");
    });

    expect(result.current.debouncedTerm).toBe("initial");
  });
});
