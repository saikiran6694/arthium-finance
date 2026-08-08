import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// Node's built-in `localStorage`/`sessionStorage` globals (unflagged since Node 22)
// shadow jsdom's implementation and ship without a working `clear()` unless
// `--localstorage-file` is set. Replace both with a plain in-memory Storage
// so tests get a real, working Web Storage API regardless of the Node version.
class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length() {
    return this.store.size;
  }

  clear() {
    this.store.clear();
  }

  getItem(key: string) {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number) {
    return Array.from(this.store.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.store.delete(key);
  }

  setItem(key: string, value: string) {
    this.store.set(key, String(value));
  }
}

function installMemoryStorage() {
  const localStorageInstance = new MemoryStorage();
  const sessionStorageInstance = new MemoryStorage();

  for (const target of [globalThis, window]) {
    Object.defineProperty(target, "localStorage", {
      value: localStorageInstance,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(target, "sessionStorage", {
      value: sessionStorageInstance,
      writable: true,
      configurable: true,
    });
  }
}

installMemoryStorage();

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal("ResizeObserver", ResizeObserverMock);

class IntersectionObserverMock {
  root = null;
  rootMargin = "";
  thresholds: number[] = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}
vi.stubGlobal("IntersectionObserver", IntersectionObserverMock);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLElement.prototype, "hasPointerCapture", {
  writable: true,
  configurable: true,
  value: vi.fn().mockReturnValue(false),
});

Object.defineProperty(HTMLElement.prototype, "setPointerCapture", {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

Object.defineProperty(HTMLElement.prototype, "releasePointerCapture", {
  writable: true,
  configurable: true,
  value: vi.fn(),
});

if (!("PointerEvent" in window)) {
  class PointerEventMock extends MouseEvent {
    pointerId = 0;
    width = 1;
    height = 1;
    pressure = 0;
    tangentialPressure = 0;
    tiltX = 0;
    tiltY = 0;
    twist = 0;
    pointerType = "mouse";
    isPrimary = true;

    constructor(type: string, params: PointerEventInit = {}) {
      super(type, params);
      Object.assign(this, params);
    }
  }
  vi.stubGlobal("PointerEvent", PointerEventMock);
}

