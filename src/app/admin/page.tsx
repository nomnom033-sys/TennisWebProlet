import Link from "next/link";
import { AlertTriangle, CalendarClock, ShieldCheck } from "lucide-react";

import { adminCancelBookingFormAction } from "@/app/actions";
import { AdminLoginForm } from "@/components/admin-login-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDisplayTime } from "@/features/bookings/format";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type AdminBookingRow = {
  id: string;
  court: { slug: string; name: string } | { slug: string; name: string }[] | null;
  start_at: string;
  end_at: string;
  status: "planned" | "current" | "played" | "cancelled";
  player_name: string;
  telegram_username: string | null;
  phone: string | null;
  phone_public: boolean;
  needs_admin_review: boolean;
  notification_status: "pending" | "sent" | "failed" | "skipped";
  created_at: string;
};

export default async function AdminPage() {
  const admin = await getCurrentAdmin();

  if (!admin.ok) {
    return (
      <main className="mx-auto grid min-h-screen max-w-2xl place-items-center px-4 py-12">
        <Card className="w-full shadow-sm">
          <CardHeader>
            <CardTitle>Админка TennisWeb</CardTitle>
            <CardDescription>
              Вход через Supabase Auth magic link и allowlist `ADMIN_EMAILS`.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {admin.reason !== "not_signed_in" && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                {admin.message}
              </div>
            )}
            <AdminLoginForm />
            <Link href="/" className="text-sm text-muted-foreground underline">
              На публичный сайт
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  const supabase = createSupabaseAdminClient();
  const { data: bookings, error } = supabase
    ? await supabase
        .from("bookings")
        .select(
          "id,court:courts(slug,name),start_at,end_at,status,player_name,telegram_username,phone,phone_public,needs_admin_review,notification_status,created_at",
        )
        .order("start_at", { ascending: false })
        .limit(100)
    : { data: null, error: { message: "Supabase service env не настроен." } };

  return (
    <main className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Администратор</p>
          <h1 className="text-3xl font-semibold">Операционная панель</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Записи, флаги ручной проверки и отмены с audit trail.
          </p>
        </div>
        <Button render={<Link href="/" />}>На сайт</Button>
      </header>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck data-icon="inline-start" />
            </span>
            <div>
              <CardTitle>Доступ подтверждён</CardTitle>
              <CardDescription>{admin.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Записи</CardTitle>
              <CardDescription>
                Последние 100 записей. Отменённые остаются в audit history.
              </CardDescription>
            </div>
            <Badge variant="secondary">{bookings?.length ?? 0} записей</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
              {error.message}
            </div>
          )}
          {!error && bookings?.length === 0 && (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Записей пока нет.
            </div>
          )}
          {!error && bookings && bookings.length > 0 && (
            <div className="grid gap-3">
              {(bookings as AdminBookingRow[]).map((booking) => (
                <article
                  key={booking.id}
                  className="grid gap-4 rounded-lg border p-4 lg:grid-cols-[1fr_auto]"
                >
                  <div className="grid gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge>{statusLabel(booking.status)}</Badge>
                      {booking.needs_admin_review && (
                        <Badge variant="destructive">
                          <AlertTriangle data-icon="inline-start" />
                          проверить
                        </Badge>
                      )}
                      <Badge variant="outline">
                        Telegram: {booking.notification_status}
                      </Badge>
                    </div>
                    <div>
                      <h2 className="font-medium">{booking.player_name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {courtLabel(booking.court)} ·{" "}
                        {formatDisplayTime(booking.start_at, booking.end_at)} ·{" "}
                        {new Intl.DateTimeFormat("ru-RU", {
                          dateStyle: "medium",
                          timeZone: "Europe/Moscow",
                        }).format(new Date(booking.start_at))}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {booking.telegram_username && (
                        <span>@{booking.telegram_username}</span>
                      )}
                      {booking.phone && <span>{booking.phone}</span>}
                      {booking.phone_public && <span>телефон публичный</span>}
                    </div>
                  </div>
                  {booking.status !== "cancelled" && (
                    <form action={adminCancelBookingFormAction}>
                      <input type="hidden" name="bookingId" value={booking.id} />
                      <Button type="submit" variant="destructive">
                        Отменить
                      </Button>
                    </form>
                  )}
                </article>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CalendarClock data-icon="inline-start" />
            <div>
              <CardTitle>Перед публикацией документов</CardTitle>
              <CardDescription>
                Файлы с `needs_redaction=true` не должны открываться для
                скачивания. Сначала удалите персональные данные и проверьте
                исходники.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>
    </main>
  );
}

function statusLabel(status: AdminBookingRow["status"]) {
  return {
    planned: "Запланировано",
    current: "Сейчас",
    played: "Сыграно",
    cancelled: "Отменено",
  }[status];
}

function courtLabel(
  court: AdminBookingRow["court"],
) {
  const value = Array.isArray(court) ? court[0] : court;
  return value?.name ?? value?.slug ?? "Корт не указан";
}
