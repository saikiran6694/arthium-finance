import { act, render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider, useTheme } from "./theme-provider";

function ThemeConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme("dark")}>dark</button>
      <button onClick={() => setTheme("light")}>light</button>
      <button onClick={() => setTheme("system")}>system</button>
    </div>
  );
}

describe("ThemeProvider / useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("light", "dark");
  });

  it("defaults to the provided defaultTheme when nothing is in storage", () => {
    render(
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("reads the initial theme from localStorage when present", () => {
    localStorage.setItem("vite-ui-theme", "dark");

    render(
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("resolves the 'system' theme using matchMedia (dark preferred)", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: true });

    render(
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("resolves the 'system' theme using matchMedia (light preferred)", () => {
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    render(
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("setTheme updates the theme, storage, and document class", async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <ThemeConsumer />
      </ThemeProvider>
    );

    await user.click(screen.getByText("dark"));

    expect(screen.getByTestId("theme")).toHaveTextContent("dark");
    expect(localStorage.getItem("vite-ui-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });

  it("uses the default storageKey when none is provided", () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    act(() => {
      screen.getByText("dark").click();
    });

    expect(localStorage.getItem("vite-ui-theme")).toBe("dark");
  });

  it("useTheme returns the current context when rendered inside a provider", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => (
        <ThemeProvider defaultTheme="dark">{children}</ThemeProvider>
      ),
    });

    expect(result.current.theme).toBe("dark");
  });
});
