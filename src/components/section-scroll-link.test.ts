import { describe, expect, it } from "vitest";

import { getLastSectionIdFromHash } from "./section-scroll-link";

describe("getLastSectionIdFromHash", () => {
  it("uses the last valid section from repeated hashes", () => {
    expect(
      getLastSectionIdFromHash("#schedule#schedule#schedule#booking"),
    ).toBe("booking");
    expect(getLastSectionIdFromHash("#schedule#schedule")).toBe("schedule");
  });

  it("ignores unrelated hashes", () => {
    expect(getLastSectionIdFromHash("#rules#unknown")).toBeNull();
  });
});
