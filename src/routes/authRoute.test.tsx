import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  authenticatedState,
  createTestStore,
  renderWithProviders,
} from "@/test/test-utils";
import { Provider } from "react-redux";
import AuthRoute from "./authRoute";

function renderAt(path: string, preloadedState?: Parameters<typeof createTestStore>[0]) {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<AuthRoute />}>
            <Route path="/" element={<div>Sign in page</div>} />
          </Route>
          <Route path="/overview" element={<div>Overview page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("AuthRoute", () => {
  it("renders the outlet when there is no authenticated session", () => {
    renderAt("/");
    expect(screen.getByText("Sign in page")).toBeInTheDocument();
  });

  it("redirects to the overview page when a session exists", () => {
    renderAt("/", authenticatedState);
    expect(screen.getByText("Overview page")).toBeInTheDocument();
  });

  it("smoke renders via the shared renderWithProviders helper", () => {
    renderWithProviders(
      <Routes>
        <Route element={<AuthRoute />}>
          <Route path="/" element={<div>Sign in page</div>} />
        </Route>
      </Routes>
    );
    expect(screen.getByText("Sign in page")).toBeInTheDocument();
  });
});
