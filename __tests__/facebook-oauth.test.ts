import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  getFacebookAuthorizationUrl,
  getFacebookLoginConfig,
} from "../lib/meta/facebook-oauth";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("FACEBOOK_APP_ID", "app-123");
});

describe("Facebook Login for Business config resolution", () => {
  it("prefers the system-user config over the user-token config", () => {
    vi.stubEnv("FACEBOOK_LOGIN_CONFIG_ID", "user-config");
    vi.stubEnv("FACEBOOK_SYSTEM_USER_CONFIG_ID", "sysuser-config");
    expect(getFacebookLoginConfig()).toEqual({
      configId: "sysuser-config",
      isSystemUser: true,
    });
  });

  it("falls back to the user-token config when no system-user config is set", () => {
    vi.stubEnv("FACEBOOK_LOGIN_CONFIG_ID", "user-config");
    expect(getFacebookLoginConfig()).toEqual({
      configId: "user-config",
      isSystemUser: false,
    });
  });

  it("drives the dialog from config_id with the forced code grant", () => {
    vi.stubEnv("FACEBOOK_SYSTEM_USER_CONFIG_ID", "sysuser-config");
    const url = new URL(getFacebookAuthorizationUrl("https://x/cb", "state1"));
    expect(url.searchParams.get("config_id")).toBe("sysuser-config");
    expect(url.searchParams.get("override_default_response_type")).toBe("true");
    expect(url.searchParams.get("scope")).toBeNull();
  });

  it("falls back to the classic scope dialog when no config id is set", () => {
    const url = new URL(getFacebookAuthorizationUrl("https://x/cb", "state1"));
    expect(url.searchParams.get("config_id")).toBeNull();
    expect(url.searchParams.get("scope")).toContain("pages_messaging");
  });
});
