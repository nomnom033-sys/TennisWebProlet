import { describe, expect, it } from "vitest";

import { formatBookingMessage, formatCancellationMessage } from "./format";

describe("Telegram-compatible booking text", () => {
  it("formats booking and cancellation text in the community standard", () => {
    const booking = {
      startAt: "2026-06-29T10:00:00+03:00",
      endAt: "2026-06-29T12:00:00+03:00",
      courtId: "proletarsky" as const,
    };

    expect(formatBookingMessage(booking)).toBe(
      "29.06 понедельник\n1000-1200\nПролетарский",
    );
    expect(formatCancellationMessage(booking)).toBe(
      "Отмена\n29.06 понедельник\n1000-1200\nПролетарский",
    );
  });

  it("uses the public court name for Obukhovsky court", () => {
    expect(
      formatBookingMessage({
        startAt: "2026-06-29T10:00:00+03:00",
        endAt: "2026-06-29T12:00:00+03:00",
        courtId: "obukhovo",
      }),
    ).toContain("Обуховский");
  });
});
