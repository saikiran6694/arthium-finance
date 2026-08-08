import { describe, expect, it } from "vitest";
import { AUTH_ROUTES, PROTECTED_ROUTES, isAuthRoute } from "./routePath";

describe("routePath", () => {
  it("exposes the expected auth and protected route paths", () => {
    expect(AUTH_ROUTES.SIGN_IN).toBe("/");
    expect(AUTH_ROUTES.SIGN_UP).toBe("/sign-up");
    expect(AUTH_ROUTES.FORGOT_PASSWORD).toBe("/forgot-password");
    expect(PROTECTED_ROUTES.OVERVIEW).toBe("/overview");
  });

  it("isAuthRoute returns true for known auth paths", () => {
    expect(isAuthRoute("/")).toBe(true);
    expect(isAuthRoute("/sign-up")).toBe(true);
    expect(isAuthRoute("/forgot-password")).toBe(true);
  });

  it("isAuthRoute returns false for other paths", () => {
    expect(isAuthRoute("/overview")).toBe(false);
    expect(isAuthRoute("/unknown")).toBe(false);
  });
});
