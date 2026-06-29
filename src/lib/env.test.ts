import { afterEach, describe, expect, it, vi } from "vitest";

import {
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  getTelegramBotToken,
  getTurnstileSecretKey,
  isSupabaseServiceConfigured,
} from "./env";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("environment helpers", () => {
  it("trims env values and normalizes accidental Supabase REST URLs", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", " https://project.supabase.co/rest/v1/ ");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", " anon-key ");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", " service-key ");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", " telegram-token ");
    vi.stubEnv("TURNSTILE_SECRET_KEY", " turnstile-secret ");

    expect(getSupabaseUrl()).toBe("https://project.supabase.co");
    expect(getSupabaseAnonKey()).toBe("anon-key");
    expect(getSupabaseServiceRoleKey()).toBe("service-key");
    expect(getTelegramBotToken()).toBe("telegram-token");
    expect(getTurnstileSecretKey()).toBe("turnstile-secret");
    expect(isSupabaseServiceConfigured()).toBe(true);
  });
});
