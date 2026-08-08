import { describe, expect, it } from "vitest";
import authReducer, {
  logout,
  setCredentials,
  updateCredentials,
} from "./authSlice";

const initialState = {
  access_token: null,
  expires_at: null,
  refresh_token: null,
  user: null,
  reportSetting: null,
};

const user = {
  _id: "1",
  name: "Jane",
  email: "jane@example.com",
  profile_picture: "pic.png",
};

describe("authSlice", () => {
  it("returns the initial state", () => {
    expect(authReducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  describe("setCredentials", () => {
    it("sets all auth fields from the payload", () => {
      const before = Date.now();
      const state = authReducer(
        initialState,
        setCredentials({
          access_token: "token",
          expires_in: 1000,
          refresh_token: "refresh",
          user,
          report_settings: { _id: "r1", is_enabled: true },
        })
      );

      expect(state.access_token).toBe("token");
      expect(state.refresh_token).toBe("refresh");
      expect(state.user).toEqual(user);
      expect(state.reportSetting).toEqual({ _id: "r1", is_enabled: true });
      expect(state.expires_at).toBeGreaterThanOrEqual(before + 1000);
    });
  });

  describe("updateCredentials", () => {
    it("updates the access token and expiry when provided", () => {
      const state = authReducer(
        { ...initialState, access_token: "old", expires_at: 1 },
        updateCredentials({ access_token: "new-token", expires_in: 5000 })
      );

      expect(state.access_token).toBe("new-token");
      expect(state.expires_at).toBeGreaterThan(Date.now());
    });

    it("leaves the access token and expiry untouched when omitted", () => {
      const state = authReducer(
        { ...initialState, access_token: "old", expires_at: 1 },
        updateCredentials({})
      );

      expect(state.access_token).toBe("old");
      expect(state.expires_at).toBe(1);
    });

    it("merges partial user updates into the existing user", () => {
      const state = authReducer(
        { ...initialState, user },
        updateCredentials({ user: { name: "Updated Name" } })
      );

      expect(state.user).toEqual({ ...user, name: "Updated Name" });
    });

    it("sets the user directly when there is no existing user", () => {
      const state = authReducer(
        initialState,
        updateCredentials({ user })
      );

      expect(state.user).toEqual(user);
    });

    it("merges partial reportSetting updates into the existing reportSetting", () => {
      const state = authReducer(
        { ...initialState, reportSetting: { _id: "r1", is_enabled: false } },
        updateCredentials({ reportSetting: { is_enabled: true } })
      );

      expect(state.reportSetting).toEqual({ _id: "r1", is_enabled: true });
    });

    it("sets reportSetting directly when there is no existing reportSetting", () => {
      const state = authReducer(
        initialState,
        updateCredentials({ reportSetting: { _id: "r1", is_enabled: true } })
      );

      expect(state.reportSetting).toEqual({ _id: "r1", is_enabled: true });
    });
  });

  describe("logout", () => {
    it("resets state back to the initial values", () => {
      const loggedInState = {
        access_token: "token",
        expires_at: Date.now(),
        refresh_token: "refresh",
        user,
        reportSetting: { _id: "r1", is_enabled: true },
      };

      expect(authReducer(loggedInState, logout())).toEqual(initialState);
    });
  });
});
