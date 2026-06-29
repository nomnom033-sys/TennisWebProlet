import { describe, expect, it } from "vitest";

import { classifyBookingStatus, planBooking } from "./domain";

const now = new Date("2026-06-28T09:00:00+03:00");

describe("planBooking", () => {
  it("accepts a valid public booking and normalizes public fields", () => {
    const result = planBooking({
      now,
      existingBookings: [],
      input: {
        courtId: "proletarsky",
        startAt: "2026-06-29T10:00:00+03:00",
        endAt: "2026-06-29T12:00:00+03:00",
        playerName: "Даниил",
        telegramUsername: "danil_tennis",
        phone: "+7 999 123-45-67",
        phonePublic: false,
      },
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.booking).toMatchObject({
      courtId: "proletarsky",
      playerName: "Даниил",
      telegramUsername: "danil_tennis",
      phone: "+7 999 123-45-67",
      phonePublic: false,
      needsAdminReview: false,
      status: "planned",
    });
    expect(result.booking.publicContact).toBe("@danil_tennis");
  });

  it("rejects missing names, overlaps, distant dates, and slots longer than the rules allow", () => {
    const existingBookings = [
      {
        id: "booking-1",
        courtId: "proletarsky" as const,
        startAt: "2026-06-29T10:30:00+03:00",
        endAt: "2026-06-29T11:30:00+03:00",
        status: "planned" as const,
        playerName: "Мария",
      },
    ];

    const result = planBooking({
      now,
      existingBookings,
      input: {
        courtId: "proletarsky",
        startAt: "2026-07-06T17:00:00+03:00",
        endAt: "2026-07-06T19:30:00+03:00",
        playerName: " ",
        phonePublic: false,
      },
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "missing_player_name",
        "outside_booking_window",
        "slot_too_long",
      ]),
    );

    const overlap = planBooking({
      now,
      existingBookings,
      input: {
        courtId: "proletarsky",
        startAt: "2026-06-29T11:00:00+03:00",
        endAt: "2026-06-29T12:00:00+03:00",
        playerName: "Даниил",
        phonePublic: false,
      },
    });

    expect(overlap.ok).toBe(false);
    if (overlap.ok) return;
    expect(overlap.issues.map((issue) => issue.code)).toContain(
      "overlapping_booking",
    );
  });

  it("enforces two active bookings only when a reliable identity is present", () => {
    const existingBookings = [
      {
        id: "booking-1",
        courtId: "proletarsky" as const,
        startAt: "2026-06-29T10:00:00+03:00",
        endAt: "2026-06-29T12:00:00+03:00",
        status: "planned" as const,
        playerName: "Даниил",
        telegramUsername: "danil_tennis",
      },
      {
        id: "booking-2",
        courtId: "obukhovo" as const,
        startAt: "2026-06-30T10:00:00+03:00",
        endAt: "2026-06-30T12:00:00+03:00",
        status: "planned" as const,
        playerName: "Даниил",
        telegramUsername: "danil_tennis",
      },
    ];

    const strictResult = planBooking({
      now,
      existingBookings,
      input: {
        courtId: "proletarsky",
        startAt: "2026-07-01T10:00:00+03:00",
        endAt: "2026-07-01T12:00:00+03:00",
        playerName: "Даниил",
        telegramUsername: "@danil_tennis",
        phonePublic: false,
      },
    });

    expect(strictResult.ok).toBe(false);
    if (strictResult.ok) return;
    expect(strictResult.issues.map((issue) => issue.code)).toContain(
      "too_many_active_bookings",
    );

    const softResult = planBooking({
      now,
      existingBookings,
      input: {
        courtId: "proletarsky",
        startAt: "2026-07-01T10:00:00+03:00",
        endAt: "2026-07-01T12:00:00+03:00",
        playerName: "Даниил",
        phonePublic: false,
      },
    });

    expect(softResult.ok).toBe(true);
    if (!softResult.ok) return;
    expect(softResult.booking.needsAdminReview).toBe(true);
    expect(softResult.warnings.map((issue) => issue.code)).toContain(
      "too_many_active_bookings",
    );
  });

  it("classifies active bookings into current, planned, played, and cancelled", () => {
    const at = new Date("2026-06-28T11:00:00+03:00");

    expect(
      classifyBookingStatus({
        status: "planned",
        startAt: "2026-06-28T10:00:00+03:00",
        endAt: "2026-06-28T12:00:00+03:00",
        at,
      }),
    ).toBe("current");

    expect(
      classifyBookingStatus({
        status: "planned",
        startAt: "2026-06-28T12:30:00+03:00",
        endAt: "2026-06-28T14:00:00+03:00",
        at,
      }),
    ).toBe("planned");

    expect(
      classifyBookingStatus({
        status: "planned",
        startAt: "2026-06-28T08:00:00+03:00",
        endAt: "2026-06-28T10:00:00+03:00",
        at,
      }),
    ).toBe("played");

    expect(
      classifyBookingStatus({
        status: "cancelled",
        startAt: "2026-06-28T08:00:00+03:00",
        endAt: "2026-06-28T10:00:00+03:00",
        at,
      }),
    ).toBe("cancelled");
  });
});
