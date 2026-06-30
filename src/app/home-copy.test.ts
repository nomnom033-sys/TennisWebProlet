import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

describe("home page copy", () => {
  it("uses the available courts metric label", () => {
    const source = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");

    expect(source).toContain("Доступных корта");
    expect(source).not.toContain("Кортов в расписании");
  });
});
