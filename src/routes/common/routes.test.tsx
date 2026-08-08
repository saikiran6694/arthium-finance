import { describe, expect, it } from "vitest";
import { AUTH_ROUTES, PROTECTED_ROUTES } from "./routePath";
import { authenticationRoutePaths, protectedRoutePaths } from "./routes";

describe("routes config", () => {
  it("defines an authentication route for every auth path", () => {
    const paths = authenticationRoutePaths.map((route) => route.path);
    expect(paths).toEqual([
      AUTH_ROUTES.SIGN_IN,
      AUTH_ROUTES.SIGN_UP,
      AUTH_ROUTES.FORGOT_PASSWORD,
    ]);
    authenticationRoutePaths.forEach((route) => {
      expect(route.element).toBeTruthy();
    });
  });

  it("defines a protected route for every top-level protected path", () => {
    const paths = protectedRoutePaths.map((route) => route.path);
    expect(paths).toEqual([
      PROTECTED_ROUTES.OVERVIEW,
      PROTECTED_ROUTES.TRANSACTIONS,
      PROTECTED_ROUTES.REPORTS,
      PROTECTED_ROUTES.SETTINGS,
      PROTECTED_ROUTES.AI_CHAT,
    ]);
  });

  it("nests the settings child routes under the settings route", () => {
    const settingsRoute = protectedRoutePaths.find(
      (route) => route.path === PROTECTED_ROUTES.SETTINGS
    );

    expect(settingsRoute?.children).toBeDefined();
    expect(settingsRoute?.children?.[0].index).toBe(true);
    expect(settingsRoute?.children?.map((child) => child.path)).toEqual([
      undefined,
      PROTECTED_ROUTES.SETTINGS,
      PROTECTED_ROUTES.SETTINGS_APPEARANCE,
      PROTECTED_ROUTES.SETTINGS_REPORT_SCHEDULE,
    ]);
  });
});
