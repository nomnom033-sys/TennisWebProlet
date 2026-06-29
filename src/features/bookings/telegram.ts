import type { PlannedBooking } from "./domain";
import { formatBookingMessage, formatCancellationMessage } from "./format";
import {
  getTelegramBotToken,
  getTelegramChatId,
  getTelegramMessageThreadId,
} from "@/lib/env";

export type TelegramNotificationResult =
  | { ok: true; status: "sent" | "skipped" }
  | { ok: false; status: "failed"; error: string };

export async function notifyTelegramBookingCreated(
  booking: PlannedBooking,
): Promise<TelegramNotificationResult> {
  const token = getTelegramBotToken();
  const chatId = getTelegramChatId();

  if (!token || !chatId) {
    return { ok: true, status: "skipped" };
  }

  const topicId = getTelegramMessageThreadId();
  const text = [
    "Новая запись через сайт",
    "",
    formatBookingMessage(booking),
    "",
    `Игрок: ${booking.playerName}`,
    booking.telegramUsername ? `Telegram: @${booking.telegramUsername}` : null,
    booking.needsAdminReview ? "Пометка: проверить вручную" : null,
  ]
    .filter(Boolean)
    .join("\n");

  return sendTelegramMessage({ token, chatId, topicId, text });
}

export async function notifyTelegramBookingCancelled(
  booking: Pick<
    PlannedBooking,
    "startAt" | "endAt" | "courtId" | "playerName" | "telegramUsername"
  >,
): Promise<TelegramNotificationResult> {
  const token = getTelegramBotToken();
  const chatId = getTelegramChatId();

  if (!token || !chatId) {
    return { ok: true, status: "skipped" };
  }

  const topicId = getTelegramMessageThreadId();
  const text = [
    "Отмена записи через сайт",
    "",
    formatCancellationMessage(booking),
    "",
    `Игрок: ${booking.playerName}`,
    booking.telegramUsername ? `Telegram: @${booking.telegramUsername}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return sendTelegramMessage({ token, chatId, topicId, text });
}

async function sendTelegramMessage({
  token,
  chatId,
  topicId,
  text,
}: {
  token: string;
  chatId: string;
  topicId: string | undefined;
  text: string;
}): Promise<TelegramNotificationResult> {
  let response: Response;
  try {
    response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: topicId ? Number(topicId) : undefined,
        text,
        disable_web_page_preview: true,
      }),
    });
  } catch (error) {
    return {
      ok: false,
      status: "failed",
      error: error instanceof Error ? error.message : "Telegram request failed",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      status: "failed",
      error: await response.text(),
    };
  }

  return { ok: true, status: "sent" };
}
