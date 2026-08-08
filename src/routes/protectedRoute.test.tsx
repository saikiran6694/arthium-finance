import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { authenticatedState, createTestStore } from "@/test/test-utils";
import ProtectedRoute from "./protectedRoute";

function renderAt(path: string, preloadedState?: Parameters<typeof createTestStore>[0]) {
  const store = createTestStore(preloadedState);
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/overview" element={<div>Overview page</div>} />
          </Route>
          <Route path="/" element={<div>Sign in page</div>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("ProtectedRoute", () => {
  it("renders the outlet when authenticated", () => {
    renderAt("/overview", authenticatedState);
    expect(screen.getByText("Overview page")).toBeInTheDocument();
  });

  it("redirects to sign-in when there is no access token or user", () => {
    renderAt("/overview");
    expect(screen.getByText("Sign in page")).toBeInTheDocument();
  });

  it("redirects to sign-in when the access token is present but the user is missing", () => {
    const store = createTestStore({
      auth: {
        access_token: "token",
        expires_at: Date.now() + 1000,
        refresh_token: "refresh",
        user: null,
        reportSetting: null,
      },
    });
    render(
      <Provider store={store}>
        <MemoryRouter initialEntries={["/overview"]}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/overview" element={<div>Overview page</div>} />
            </Route>
            <Route path="/" element={<div>Sign in page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );

    expect(screen.getByText("Sign in page")).toBeInTheDocument();
  });
});
