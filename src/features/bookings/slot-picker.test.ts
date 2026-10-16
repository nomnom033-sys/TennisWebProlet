import { describe, expect, it } from "vitest";

import {
  addMinutesToLocalDateTime,
  buildBookingSlot,
  clampDurationMinutes,
  formatDuration,
  minutesBetweenLocalDateTimes,
} from "./slot-picker";

describe("booking slot picker helpers", () => {
  it("builds startAt and endAt from a local date, start time, and duration", () => {
    const slot = buildBookingSlot({
      date: "2026-07-02",
      startTime: "18:30",
      durationMinutes: 90,
    });

    expect(slot).toEqual({
      date: "2026-07-02",
      startTime: "18:30",
      durationMinutes: 90,
      endTime: "20:00",
      startAt: "2026-07-02T18:30",
      endAt: "2026-07-02T20:00",
    });
  });

  it("adds minutes across midnight while preserving datetime-local formatting", () => {
    expect(addMinutesToLocalDateTime("2026-07-02T23:30", 90)).toBe(
      "2026-07-03T01:00",
    );
  });

  it("derives duration from a manually edited end time", () => {
    expect(
      minutesBetweenLocalDateTimes("2026-07-02T17:20", "2026-07-02T19:05"),
    ).toBe(105);
  });

  it("clamps duration to the 1-2 hour public picker range", () => {
    expect(clampDurationMinutes(35)).toBe(60);
    expect(clampDurationMinutes(90)).toBe(90);
    expect(clampDurationMinutes(155)).toBe(120);
  });

  it("formats duration like a short mobile booking control label", () => {
    expect(formatDuration(60)).toBe("1 ч");
    expect(formatDuration(95)).toBe("1 ч 35 мин");
    expect(formatDuration(120)).toBe("2 ч");
  });
});
