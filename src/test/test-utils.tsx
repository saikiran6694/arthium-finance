import type { PropsWithChildren, ReactElement } from "react";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { render, type RenderOptions } from "@testing-library/react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import authReducer from "@/features/auth/authSlice";
import { apiClient } from "@/app/api-client";
import { ThemeProvider } from "@/context/theme-provider";
import type { RootState } from "@/app/store";

type PreloadedRootState = { [K in keyof RootState]?: RootState[K] };

const rootReducer = combineReducers({
  [apiClient.reducerPath]: apiClient.reducer,
  auth: authReducer,
});

export function createTestStore(preloadedState?: PreloadedRootState) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiClient.middleware),
  });
}

export type TestStore = ReturnType<typeof createTestStore>;

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedRootState;
  store?: TestStore;
  route?: string;
}

export const authenticatedState: PreloadedRootState = {
  auth: {
    access_token: "test-access-token",
    expires_at: Date.now() + 1000 * 60 * 60,
    refresh_token: "test-refresh-token",
    user: {
      _id: "user-1",
      name: "Test User",
      email: "test@example.com",
      profile_picture: "",
    },
    reportSetting: null,
  },
};

export function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState,
    store = createTestStore(preloadedState),
    route = "/",
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren) {
    return (
      <Provider store={store}>
        <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

export * from "@testing-library/react";
