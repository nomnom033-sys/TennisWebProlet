"use client";

import Script from "next/script";
import { useActionState } from "react";
import { CalendarPlus, CheckCircle2 } from "lucide-react";

import { createBookingAction, type BookingActionState } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Court } from "@/lib/site-data";

const initialState: BookingActionState = {
  ok: false,
  message: "",
};

export function BookingForm({ courts }: { courts: Court[] }) {
  const [state, formAction, pending] = useActionState(
    createBookingAction,
    initialState,
  );
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  return (
    <Card id="booking" className="border-primary/10 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <CalendarPlus data-icon="inline-start" />
          </span>
          <div>
            <CardTitle>Записаться на корт</CardTitle>
            <CardDescription>
              Запись попадёт в расписание сайта. Это электронная очередь
              сообщества, а не коммерческая гарантия доступа к муниципальному
              корту.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="courtId">Корт</Label>
            <select
              id="courtId"
              name="courtId"
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
              defaultValue="proletarsky"
            >
              {courts.map((court) => (
                <option key={court.id} value={court.id}>
                  {court.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="startAt">Начало</Label>
              <Input id="startAt" name="startAt" type="datetime-local" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endAt">Окончание</Label>
              <Input id="endAt" name="endAt" type="datetime-local" required />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="playerName">Имя или ник</Label>
            <Input
              id="playerName"
              name="playerName"
              placeholder="Например, Даниил"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="telegramUsername">Telegram ник</Label>
              <Input
                id="telegramUsername"
                name="telegramUsername"
                placeholder="@username, необязательно"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Телефон</Label>
              <Input id="phone" name="phone" placeholder="+7..., необязательно" />
            </div>
          </div>

          <label className="flex items-start gap-3 rounded-lg border p-3 text-sm text-muted-foreground">
            <Checkbox name="phonePublic" />
            <span>
              Телефон можно показывать публично для связи по записи. Telegram
              ник, если указан, будет виден в расписании.
            </span>
          </label>

          {turnstileSiteKey && (
            <div className="overflow-hidden rounded-lg border bg-muted/30 p-3">
              <Script
                src="https://challenges.cloudflare.com/turnstile/v0/api.js"
                strategy="afterInteractive"
              />
              <div
                className="cf-turnstile"
                data-sitekey={turnstileSiteKey}
                data-theme="light"
              />
            </div>
          )}

          {state.message && (
            <Alert variant={state.ok ? "default" : "destructive"}>
              <CheckCircle2 />
              <AlertTitle>{state.ok ? "Готово" : "Нужно исправить"}</AlertTitle>
              <AlertDescription>
                <p>{state.message}</p>
                {state.issues && state.issues.length > 0 && (
                  <ul className="mt-2 list-disc pl-5">
                    {state.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                )}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={pending} className="w-full sm:w-fit">
            {pending ? "Проверяем..." : "Создать запись"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
