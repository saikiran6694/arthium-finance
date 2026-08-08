import { HttpResponse, http } from "msw";
import { describe, expect, it } from "vitest";
import { createTestStore } from "@/test/test-utils";
import { server } from "@/test/mocks/server";
import { authApi } from "./authAPI";

const API_URL = import.meta.env.VITE_API_URL;

describe("authApi", () => {
  it("register posts credentials to /auth/register", async () => {
    let received: unknown;
    server.use(
      http.post(`${API_URL}/auth/register`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ message: "ok" });
      })
    );

    const store = createTestStore();
    const result = await store
      .dispatch(
        authApi.endpoints.register.initiate({
          name: "Jane",
          email: "jane@example.com",
          password: "secret",
        })
      )
      .unwrap();

    expect(result).toEqual({ message: "ok" });
    expect(received).toEqual({
      name: "Jane",
      email: "jane@example.com",
      password: "secret",
    });
  });

  it("login posts credentials to /auth/login", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({ access_token: "t", expires_in: 100 })
      )
    );

    const store = createTestStore();
    const result = await store
      .dispatch(
        authApi.endpoints.login.initiate({
          email: "jane@example.com",
          password: "secret",
        })
      )
      .unwrap();

    expect(result).toEqual({ access_token: "t", expires_in: 100 });
  });

  it("refresh posts the refresh token to /auth/refresh-token", async () => {
    let received: unknown;
    server.use(
      http.post(`${API_URL}/auth/refresh-token`, async ({ request }) => {
        received = await request.json();
        return HttpResponse.json({ access_token: "new", expires_in: 100 });
      })
    );

    const store = createTestStore();
    const result = await store
      .dispatch(
        authApi.endpoints.refresh.initiate({ refresh_token: "refresh" })
      )
      .unwrap();

    expect(result).toEqual({ access_token: "new", expires_in: 100 });
    expect(received).toEqual({ refresh_token: "refresh" });
  });

  it("forgotPasswordSendOtp posts the email to /auth/forgot-password/send-otp", async () => {
    server.use(
      http.post(`${API_URL}/auth/forgot-password/send-otp`, () =>
        HttpResponse.json({ message: "otp sent" })
      )
    );

    const store = createTestStore();
    const result = await store
      .dispatch(
        authApi.endpoints.forgotPasswordSendOtp.initiate({
          email: "jane@example.com",
        })
      )
      .unwrap();

    expect(result).toEqual({ message: "otp sent" });
  });

  it("forgotPasswordVerifyOtp posts the email and otp to /auth/forgot-password/verify-otp", async () => {
    server.use(
      http.post(`${API_URL}/auth/forgot-password/verify-otp`, () =>
        HttpResponse.json({ message: "verified", otp_valid: true })
      )
    );

    const store = createTestStore();
    const result = await store
      .dispatch(
        authApi.endpoints.forgotPasswordVerifyOtp.initiate({
          email: "jane@example.com",
          otp: "123456",
        })
      )
      .unwrap();

    expect(result).toEqual({ message: "verified", otp_valid: true });
  });

  it("forgotPasswordReset posts the new password to /auth/forgot-password/reset", async () => {
    server.use(
      http.post(`${API_URL}/auth/forgot-password/reset`, () =>
        HttpResponse.json({ message: "reset" })
      )
    );

    const store = createTestStore();
    const result = await store
      .dispatch(
        authApi.endpoints.forgotPasswordReset.initiate({
          email: "jane@example.com",
          new_password: "newsecret",
        })
      )
      .unwrap();

    expect(result).toEqual({ message: "reset" });
  });

  it("surfaces an error response", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({ message: "invalid credentials" }, { status: 401 })
      ),
      // A 401 triggers the shared reauth flow in api-client.ts; mock it too
      // so the unhandled-request guard doesn't fail this test.
      http.post(`${API_URL}/auth/refresh-token`, () =>
        HttpResponse.json({ message: "no session" }, { status: 401 })
      )
    );

    const store = createTestStore();
    await expect(
      store
        .dispatch(
          authApi.endpoints.login.initiate({
            email: "jane@example.com",
            password: "wrong",
          })
        )
        .unwrap()
    ).rejects.toMatchObject({ status: 401 });
  });
});
