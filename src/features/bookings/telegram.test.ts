import { afterEach, describe, expect, it, vi } from "vitest";

import { notifyTelegramBookingCreated } from "./telegram";

describe("Telegram booking notifications", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("does not include the manual review note field in created messages", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "bot-token");
    vi.stubEnv("TELEGRAM_CHAT_ID", "chat-id");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
    } satisfies Partial<Response>);
    vi.stubGlobal("fetch", fetchMock);

    await notifyTelegramBookingCreated({
      courtId: "proletarsky",
      startAt: "2026-06-30T10:00:00+03:00",
      endAt: "2026-06-30T12:00:00+03:00",
      playerName: "Тест",
      status: "planned",
      needsAdminReview: true,
      publicContact: null,
    });

    const [, request] = fetchMock.mock.calls[0];
    const body = JSON.parse(String(request.body)) as { text: string };

    expect(body.text).toContain("Новая запись через сайт");
    expect(body.text).toContain("Игрок: Тест");
    expect(body.text).not.toContain("Пометка");
  });
});
