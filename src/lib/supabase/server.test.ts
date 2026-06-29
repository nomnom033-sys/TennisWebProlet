import { describe, expect, it, vi } from "vitest";

import { createSupabaseCookieMethods } from "./server";

describe("createSupabaseCookieMethods", () => {
  it("keeps admin Server Component rendering alive when Supabase tries to refresh cookies", () => {
    const cookieStore = {
      getAll: vi.fn(() => [{ name: "sb-token", value: "old-token" }]),
      set: vi.fn(() => {
        throw new Error(
          "Cookies can only be modified in a Server Action or Route Handler.",
        );
      }),
    };

    const cookieMethods = createSupabaseCookieMethods(cookieStore as never);

    expect(() =>
      cookieMethods.setAll([
        {
          name: "sb-token",
          value: "new-token",
          options: { path: "/" },
        },
      ]),
    ).not.toThrow();
    expect(cookieStore.set).toHaveBeenCalledOnce();
  });

  it("still surfaces unexpected cookie write errors", () => {
    const cookieStore = {
      getAll: vi.fn(() => []),
      set: vi.fn(() => {
        throw new Error("unexpected cookie failure");
      }),
    };

    const cookieMethods = createSupabaseCookieMethods(cookieStore as never);

    expect(() =>
      cookieMethods.setAll([
        {
          name: "sb-token",
          value: "new-token",
          options: { path: "/" },
        },
      ]),
    ).toThrow("unexpected cookie failure");
  });
});
