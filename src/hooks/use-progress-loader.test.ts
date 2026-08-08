import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProgressLoader } from "./use-progress-loader";

describe("useProgressLoader", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with progress 0 and isLoading false", () => {
    const { result } = renderHook(() => useProgressLoader());
    expect(result.current.progress).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });

  it("startProgress uses the default initial progress and sets isLoading", () => {
    const { result } = renderHook(() => useProgressLoader());

    act(() => {
      result.current.startProgress();
    });

    expect(result.current.progress).toBe(10);
    expect(result.current.isLoading).toBe(true);
  });

  it("startProgress accepts a custom initial value", () => {
    const { result } = renderHook(() => useProgressLoader());

    act(() => {
      result.current.startProgress(50);
    });

    expect(result.current.progress).toBe(50);
  });

  it("startProgress clamps values above 100 and below 0", () => {
    const { result } = renderHook(() => useProgressLoader());

    act(() => {
      result.current.startProgress(500);
    });
    expect(result.current.progress).toBe(100);

    act(() => {
      result.current.startProgress(-10);
    });
    expect(result.current.progress).toBe(0);
  });

  it("respects a custom configured initialProgress default", () => {
    const { result } = renderHook(() =>
      useProgressLoader({ initialProgress: 25 })
    );

    act(() => {
      result.current.startProgress();
    });

    expect(result.current.progress).toBe(25);
  });

  it("updateProgress sets and clamps the progress value", () => {
    const { result } = renderHook(() => useProgressLoader());

    act(() => {
      result.current.updateProgress(42);
    });
    expect(result.current.progress).toBe(42);

    act(() => {
      result.current.updateProgress(-5);
    });
    expect(result.current.progress).toBe(0);

    act(() => {
      result.current.updateProgress(150);
    });
    expect(result.current.progress).toBe(100);
  });

  it("doneProgress sets progress to 100 and clears isLoading after the completion delay", () => {
    const { result } = renderHook(() =>
      useProgressLoader({ completionDelay: 300 })
    );

    act(() => {
      result.current.startProgress();
    });

    act(() => {
      result.current.doneProgress();
    });
    expect(result.current.progress).toBe(100);
    expect(result.current.isLoading).toBe(true);

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("doneProgress returns a cleanup function that clears the pending timer", () => {
    const { result } = renderHook(() =>
      useProgressLoader({ completionDelay: 300 })
    );

    let cleanup: (() => void) | undefined;
    act(() => {
      // doneProgress is typed as `() => void` but actually returns a cleanup
      // function at runtime; cast to capture it for this test.
      cleanup = (
        result.current.doneProgress as unknown as () => () => void
      )();
    });

    act(() => {
      cleanup?.();
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.isLoading).toBe(false);
  });

  it("resetProgress resets progress and isLoading", () => {
    const { result } = renderHook(() => useProgressLoader());

    act(() => {
      result.current.startProgress(80);
    });
    act(() => {
      result.current.resetProgress();
    });

    expect(result.current.progress).toBe(0);
    expect(result.current.isLoading).toBe(false);
  });
});
