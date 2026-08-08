import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useIsMobile } from "./use-mobile";

function mockMatchMedia() {
  let changeListener: (() => void) | undefined;
  const mql = {
    matches: false,
    media: "",
    addEventListener: vi.fn((_event: string, cb: () => void) => {
      changeListener = cb;
    }),
    removeEventListener: vi.fn(),
  };
  window.matchMedia = vi.fn().mockReturnValue(mql);
  return {
    triggerChange: () => changeListener?.(),
  };
}

describe("useIsMobile", () => {
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: originalInnerWidth,
    });
  });

  it("returns false when the viewport is wider than the breakpoint", () => {
    mockMatchMedia();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it("returns true when the viewport is narrower than the breakpoint", () => {
    mockMatchMedia();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 500,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it("updates when the media query change listener fires", () => {
    const { triggerChange } = mockMatchMedia();
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 400,
    });
    act(() => {
      triggerChange();
    });

    expect(result.current).toBe(true);
  });

  it("removes the change listener on unmount", () => {
    mockMatchMedia();
    const { unmount } = renderHook(() => useIsMobile());
    expect(() => unmount()).not.toThrow();
  });
});
