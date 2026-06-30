import { describe, expect, it } from "vitest";

import { parseBookingFormData } from "./schema";

describe("parseBookingFormData", () => {
  it("parses and trims the public booking form contract", () => {
    const formData = new FormData();
    formData.set("courtId", "proletarsky");
    formData.set("startAt", "2026-06-29T10:00");
    formData.set("endAt", "2026-06-29T12:00");
    formData.set("playerName", "  Даниил  ");
    formData.set("telegramUsername", " @danil_tennis ");
    formData.set("phone", "  +7 999 123-45-67 ");
    formData.set("phonePublic", "on");

    const result = parseBookingFormData(formData);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.input).toEqual({
      courtId: "proletarsky",
      startAt: "2026-06-29T10:00",
      endAt: "2026-06-29T12:00",
      playerName: "Даниил",
      telegramUsername: "@danil_tennis",
      phone: "+7 999 123-45-67",
      phonePublic: true,
    });
  });

  it("rejects invalid courts and missing player names before mutation", () => {
    const formData = new FormData();
    formData.set("courtId", "private-court");
    formData.set("startAt", "2026-06-29T10:00");
    formData.set("endAt", "2026-06-29T12:00");
    formData.set("playerName", " ");

    const result = parseBookingFormData(formData);

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.issues).toEqual(
      expect.arrayContaining([
        "Выберите корректный корт.",
        "Укажите имя, которое будет видно в расписании.",
      ]),
    );
  });
});
