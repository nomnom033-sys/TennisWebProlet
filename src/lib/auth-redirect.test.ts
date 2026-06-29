import { describe, expect, it } from "vitest";

import {
  buildAdminAuthRedirectUrl,
  normalizeAuthNextPath,
} from "./auth-redirect";

describe("admin auth redirect", () => {
  it("sends magic links through the callback route before returning to admin", () => {
    expect(buildAdminAuthRedirectUrl("https://tennis-web-prolet.vercel.app")).toBe(
      "https://tennis-web-prolet.vercel.app/auth/callback?next=%2Fadmin",
    );
  });

  it("normalizes site urls and ignores invalid values", () => {
    expect(
      buildAdminAuthRedirectUrl("https://tennis-web-prolet.vercel.app/admin?x=1"),
    ).toBe("https://tennis-web-prolet.vercel.app/auth/callback?next=%2Fadmin");
    expect(buildAdminAuthRedirectUrl("")).toBeUndefined();
    expect(buildAdminAuthRedirectUrl("not a url")).toBeUndefined();
  });

  it("keeps callback next redirects on local paths only", () => {
    expect(normalizeAuthNextPath("/admin")).toBe("/admin");
    expect(normalizeAuthNextPath("https://example.com/admin")).toBe("/admin");
    expect(normalizeAuthNextPath("//example.com/admin")).toBe("/admin");
    expect(normalizeAuthNextPath(null)).toBe("/admin");
  });
});
