import { beforeEach, describe, expect, it } from "vitest";

import {
  clearStoredCancelLink,
  readStoredCancelLink,
  saveStoredCancelLink,
} from "./cancel-link-storage";

describe("cancel link local storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("saves and reads the latest one-time cancellation link", () => {
    const storage = window.localStorage;
    const cancelUrl = "https://tennis-web-prolet.vercel.app/cancel/token-1";

    saveStoredCancelLink(storage, cancelUrl);

    expect(readStoredCancelLink(storage)).toEqual({
      cancelUrl,
    });
  });

  it("ignores malformed stored cancellation data", () => {
    const storage = window.localStorage;

    storage.setItem("prolettennis:last-cancel-link", "not-json");

    expect(readStoredCancelLink(storage)).toBeNull();
  });

  it("clears only the matching cancellation link after successful cancellation", () => {
    const storage = window.localStorage;
    const cancelUrl = "https://tennis-web-prolet.vercel.app/cancel/token-1";

    saveStoredCancelLink(storage, cancelUrl);
    clearStoredCancelLink(storage, "https://tennis-web-prolet.vercel.app/cancel/token-2");

    expect(readStoredCancelLink(storage)).toEqual({ cancelUrl });

    clearStoredCancelLink(storage, cancelUrl);

    expect(readStoredCancelLink(storage)).toBeNull();
  });
});
