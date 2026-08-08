import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { Outlet } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { authenticatedState, createTestStore } from "@/test/test-utils";
import AppRoutes from "./index";

vi.mock("@/pages/auth/sign-in", () => ({ default: () => <div>SignIn Page</div> }));
vi.mock("@/pages/auth/sign-up", () => ({ default: () => <div>SignUp Page</div> }));
vi.mock("@/pages/auth/forgot-password", () => ({
  default: () => <div>ForgotPassword Page</div>,
}));
vi.mock("@/pages/dashboard", () => ({ default: () => <div>Dashboard Page</div> }));
vi.mock("@/pages/transactions", () => ({
  default: () => <div>Transactions Page</div>,
}));
vi.mock("@/pages/reports", () => ({ default: () => <div>Reports Page</div> }));
vi.mock("@/pages/settings", () => ({
  default: () => (
    <div>
      Settings Page
      <Outlet />
    </div>
  ),
}));
vi.mock("@/pages/settings/account", () => ({
  default: () => <div>Account Page</div>,
}));
vi.mock("@/pages/settings/appearance", () => ({
  default: () => <div>Appearance Page</div>,
}));
vi.mock("@/pages/ai-chat/index", () => ({ default: () => <div>AiChat Page</div> }));
vi.mock("@/pages/settings/schedular", () => ({
  default: () => <div>Schedular Page</div>,
}));

vi.mock("@/layouts/app-layout", () => ({
  default: () => (
    <div data-testid="app-layout">
      <Outlet />
    </div>
  ),
}));
vi.mock("@/layouts/base-layout", () => ({
  default: () => (
    <div data-testid="base-layout">
      <Outlet />
    </div>
  ),
}));

function renderAppAt(
  path: string,
  preloadedState?: Parameters<typeof createTestStore>[0]
) {
  window.history.pushState({}, "", path);
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  );
}

describe("AppRoutes", () => {
  afterEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders the sign-in page for an unauthenticated user at the root path", () => {
    renderAppAt("/");
    expect(screen.getByText("SignIn Page")).toBeInTheDocument();
  });

  it("renders the sign-up page", () => {
    renderAppAt("/sign-up");
    expect(screen.getByText("SignUp Page")).toBeInTheDocument();
  });

  it("renders the forgot-password page", () => {
    renderAppAt("/forgot-password");
    expect(screen.getByText("ForgotPassword Page")).toBeInTheDocument();
  });

  it("redirects an unauthenticated user away from a protected route", () => {
    renderAppAt("/overview");
    expect(screen.getByText("SignIn Page")).toBeInTheDocument();
  });

  it("renders protected pages inside the app layout for an authenticated user", () => {
    renderAppAt("/overview", authenticatedState);
    expect(screen.getByTestId("app-layout")).toBeInTheDocument();
    expect(screen.getByText("Dashboard Page")).toBeInTheDocument();
  });

  it("renders nested settings child routes", () => {
    renderAppAt("/settings/appearance", authenticatedState);
    expect(screen.getByText("Appearance Page")).toBeInTheDocument();
  });

  it("renders the default (index) settings child route", () => {
    renderAppAt("/settings", authenticatedState);
    expect(screen.getByText("Account Page")).toBeInTheDocument();
  });

  it("renders a 404 for an unknown authenticated path", () => {
    renderAppAt("/does-not-exist", authenticatedState);
    expect(screen.getByText("404")).toBeInTheDocument();
  });
});
