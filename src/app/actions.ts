"use server";

import { revalidatePath } from "next/cache";

import { planBooking, type CourtId } from "@/features/bookings/domain";
import { buildCancelUrl } from "@/features/bookings/cancel-url";
import { parseBookingFormData } from "@/features/bookings/schema";
import {
  notifyTelegramBookingCancelled,
  notifyTelegramBookingCreated,
} from "@/features/bookings/telegram";
import { createCancelToken, hashCancelToken } from "@/features/bookings/tokens";
import { verifyTurnstileToken } from "@/features/security/turnstile";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { buildAdminAuthRedirectUrl } from "@/lib/auth-redirect";
import { isSupabaseServiceConfigured } from "@/lib/env";
import { seedBookings } from "@/lib/site-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type BookingActionState = {
  ok: boolean;
  message: string;
  issues?: string[];
  cancelUrl?: string;
};

export async function createBookingAction(
  _previousState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const parsedInput = parseBookingFormData(formData);
  if (!parsedInput.ok) {
    return {
      ok: false,
      message: "Запись не создана. Проверьте поля формы.",
      issues: parsedInput.issues,
    };
  }
  const input = parsedInput.input;

  const protection = await verifyTurnstileToken(
    optionalFormString(formData.get("cf-turnstile-response")),
  );
  if (!protection.ok) {
    return {
      ok: false,
      message: protection.message,
    };
  }

  const existingBookings = isSupabaseServiceConfigured()
    ? await loadExistingBookings()
    : seedBookings;

  const result = planBooking({
    now: new Date(),
    existingBookings,
    input,
  });

  if (!result.ok) {
    return {
      ok: false,
      message: "Запись не создана. Проверьте правила и исправьте поля.",
      issues: result.issues.map((issue) => issue.message),
    };
  }

  if (!isSupabaseServiceConfigured()) {
    return {
      ok: true,
      message:
        "Форма прошла проверку. Подключите Supabase service env, чтобы сохранять записи как источник истины.",
      issues: result.warnings.map((issue) => issue.message),
    };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase не настроен. Проверьте переменные окружения.",
    };
  }

  const { data: court } = await supabase
    .from("courts")
    .select("id")
    .eq("slug", result.booking.courtId)
    .single();

  if (!court) {
    return {
      ok: false,
      message: "Корт не найден в базе данных.",
    };
  }

  const notification = await notifyTelegramBookingCreated(result.booking);
  const cancelToken = createCancelToken();
  const cancelUrl = buildCancelUrl({
    token: cancelToken,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelProjectProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    vercelUrl: process.env.VERCEL_URL,
  });

  const { data: insertedBooking, error } = await supabase.from("bookings").insert({
    court_id: court.id,
    start_at: result.booking.startAt,
    end_at: result.booking.endAt,
    player_name: result.booking.playerName,
    telegram_username: result.booking.telegramUsername,
    phone: result.booking.phone,
    phone_public: result.booking.phonePublic,
    cancel_token_hash: hashCancelToken(cancelToken),
    needs_admin_review: result.booking.needsAdminReview,
    notification_status: notification.status,
  }).select("id").single();

  if (error) {
    return {
      ok: false,
      message: "Запись не сохранена: слот мог быть занят другой записью.",
      issues: [error.message],
    };
  }

  if (insertedBooking) {
    await supabase.from("booking_events").insert({
      booking_id: insertedBooking.id,
      event_type: "created",
      actor: "public",
      note: notification.status === "failed" ? notification.error : null,
    });
  }

  revalidatePath("/");

  return {
    ok: true,
    message:
      notification.status === "failed"
        ? "Запись сохранена, но Telegram-уведомление нужно повторить из админки."
        : "Запись сохранена. Сохраните одноразовую ссылку для отмены брони.",
    cancelUrl,
    issues: result.warnings.map((issue) => issue.message),
  };
}

export async function cancelBookingAction(formData: FormData) {
  const token = optionalFormString(formData.get("token"));
  if (!token) {
    return { ok: false, message: "Нет токена отмены." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase service env не настроен, отмена недоступна.",
    };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id,status,court:courts(slug),start_at,end_at,player_name,telegram_username")
    .eq("cancel_token_hash", hashCancelToken(token))
    .neq("status", "cancelled")
    .single();

  if (!booking) {
    return { ok: false, message: "Запись не найдена или уже отменена." };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", booking.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  const notification = await notifyTelegramBookingCancelled({
    courtId: relationSlug(booking.court) as CourtId,
    startAt: booking.start_at,
    endAt: booking.end_at,
    playerName: booking.player_name,
    telegramUsername: booking.telegram_username,
  });

  await supabase.from("booking_events").insert({
    booking_id: booking.id,
    event_type: "cancelled",
    actor: "public",
    note: notification.status === "failed" ? notification.error : null,
  });

  revalidatePath("/");
  return { ok: true, message: "Запись отменена." };
}

export async function cancelBookingStateAction(
  _previousState: { ok: boolean; message: string },
  formData: FormData,
) {
  return cancelBookingAction(formData);
}

export async function requestAdminMagicLinkAction(formData: FormData) {
  const email = optionalFormString(formData.get("email"));
  if (!email) {
    return { ok: false, message: "Укажите email администратора." };
  }

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLocaleLowerCase())
    .filter(Boolean);

  if (allowlist.length > 0 && !allowlist.includes(email.toLocaleLowerCase())) {
    return { ok: false, message: "Этот email не входит в список администраторов." };
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return { ok: false, message: "Supabase Auth не настроен." };
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: buildAdminAuthRedirectUrl(process.env.NEXT_PUBLIC_SITE_URL),
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Magic link отправлен на email." };
}

export async function requestAdminMagicLinkStateAction(
  _previousState: { ok: boolean; message: string },
  formData: FormData,
) {
  return requestAdminMagicLinkAction(formData);
}

export async function adminCancelBookingAction(formData: FormData) {
  const admin = await getCurrentAdmin();
  if (!admin.ok) {
    return { ok: false, message: admin.message };
  }

  const bookingId = optionalFormString(formData.get("bookingId"));
  if (!bookingId) {
    return { ok: false, message: "Нет id записи." };
  }

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return {
      ok: false,
      message: "Supabase service env не настроен, админская отмена недоступна.",
    };
  }

  const { data: booking } = await supabase
    .from("bookings")
    .select("id,status,court:courts(slug),start_at,end_at,player_name,telegram_username")
    .eq("id", bookingId)
    .neq("status", "cancelled")
    .single();

  if (!booking) {
    return { ok: false, message: "Запись не найдена или уже отменена." };
  }

  const { error } = await supabase
    .from("bookings")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", booking.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  const notification = await notifyTelegramBookingCancelled({
    courtId: relationSlug(booking.court) as CourtId,
    startAt: booking.start_at,
    endAt: booking.end_at,
    playerName: booking.player_name,
    telegramUsername: booking.telegram_username,
  });

  await supabase.from("booking_events").insert({
    booking_id: booking.id,
    event_type: "cancelled",
    actor: `admin:${admin.email}`,
    note: notification.status === "failed" ? notification.error : null,
  });

  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true, message: "Запись отменена администратором." };
}

export async function adminCancelBookingFormAction(formData: FormData) {
  await adminCancelBookingAction(formData);
}

async function loadExistingBookings() {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return seedBookings;

  const { data } = await supabase
    .from("bookings")
    .select("id,court:courts(slug),start_at,end_at,status,player_name,telegram_username,phone")
    .neq("status", "cancelled");

  return (data ?? []).map((booking) => ({
    id: booking.id,
    courtId: relationSlug(booking.court) as CourtId,
    startAt: booking.start_at,
    endAt: booking.end_at,
    status: booking.status,
    playerName: booking.player_name,
    telegramUsername: booking.telegram_username,
    phone: booking.phone,
  }));
}

function optionalFormString(value: FormDataEntryValue | null) {
  const normalized = String(value ?? "").trim();
  return normalized ? normalized : undefined;
}

function relationSlug(value: { slug: string } | { slug: string }[] | null) {
  return Array.isArray(value) ? value[0]?.slug : value?.slug;
}
