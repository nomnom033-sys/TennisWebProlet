import { afterEach, describe, expect, it, vi } from "vitest";

import { verifyTurnstileToken } from "./turnstile";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("verifyTurnstileToken", () => {
  it("skips validation when Turnstile secret is not configured", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "");

    await expect(verifyTurnstileToken(undefined)).resolves.toEqual({
      ok: true,
      status: "skipped",
    });
  });

  it("requires a response token when Turnstile secret is configured", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");

    await expect(verifyTurnstileToken(undefined)).resolves.toEqual({
      ok: false,
      message: "Подтвердите защиту формы перед записью.",
    });
  });

  it("accepts successful Siteverify responses", async () => {
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );

    await expect(verifyTurnstileToken("token")).resolves.toEqual({
      ok: true,
      status: "verified",
    });
  });
});
