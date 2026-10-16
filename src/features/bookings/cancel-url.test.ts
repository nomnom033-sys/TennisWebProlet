import { describe, expect, it } from "vitest";

import { buildCancelUrl } from "./cancel-url";

describe("booking cancellation URL", () => {
  it("builds a full absolute one-time cancellation link", () => {
    expect(
      buildCancelUrl({
        siteUrl: "https://tennis-web-prolet.vercel.app/",
        token: "cancel-token",
      }),
    ).toBe("https://tennis-web-prolet.vercel.app/cancel/cancel-token");
  });

  it("falls back to the production site when env origin is missing", () => {
    expect(buildCancelUrl({ token: "cancel-token" })).toBe(
      "https://tennis-web-prolet.vercel.app/cancel/cancel-token",
    );
  });
});
