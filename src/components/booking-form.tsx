"use client";

import Script from "next/script";
import { useActionState, useState } from "react";
import { CalendarPlus, CheckCircle2, Clock3, Minus, Plus } from "lucide-react";

import { createBookingAction, type BookingActionState } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildBookingSlot,
  clampDurationMinutes,
  formatDuration,
  minutesBetweenLocalDateTimes,
} from "@/features/bookings/slot-picker";
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
    <Card
      id="booking"
      className="scroll-mt-28 rounded-[28px] border-foreground/10 shadow-sm"
    >
      <CardHeader>
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
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

          <BookingSlotPicker />

          <div className="grid gap-2">
            <Label htmlFor="playerName">Имя</Label>
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
                {state.cancelUrl && (
                  <div className="mt-3 grid gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <a
                      href={state.cancelUrl}
                      className="break-all font-semibold text-destructive underline underline-offset-4"
                    >
                      {state.cancelUrl}
                    </a>
                    <p className="text-xs leading-5 text-muted-foreground">
                      Ссылка удаления одноразовая. Сохраните её сразу: после
                      перехода и отмены брони повторно использовать ссылку
                      нельзя.
                    </p>
                  </div>
                )}
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

function BookingSlotPicker() {
  const initialSlot = getInitialSlot();
  const [date, setDate] = useState(initialSlot.date);
  const [startTime, setStartTime] = useState(initialSlot.startTime);
  const [durationMinutes, setDurationMinutes] = useState(90);
  const durationMax = getMaxDurationForStart(startTime);
  const safeDuration = Math.min(durationMax, clampDurationMinutes(durationMinutes));
  const slot = buildBookingSlot({ date, startTime, durationMinutes: safeDuration });

  function updateStartTime(value: string) {
    setStartTime(value);
    setDurationMinutes((current) =>
      Math.min(getMaxDurationForStart(value), clampDurationMinutes(current)),
    );
  }

  function updateEndTime(value: string) {
    const nextDuration = minutesBetweenLocalDateTimes(
      slot.startAt,
      `${date}T${value}`,
    );

    setDurationMinutes(
      Math.min(durationMax, clampDurationMinutes(nextDuration)),
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-foreground/10 bg-secondary/35 p-3">
      <input type="hidden" name="startAt" value={slot.startAt} />
      <input type="hidden" name="endAt" value={slot.endAt} />

      <div className="grid gap-2">
        <Label htmlFor="bookingDate">Дата</Label>
        <Input
          id="bookingDate"
          type="date"
          min={formatDateInput(new Date())}
          max={formatDateInput(addDays(new Date(), 7))}
          value={date}
          onChange={(event) => setDate(event.target.value)}
          onInput={(event) => setDate(event.currentTarget.value)}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="grid grid-cols-[88px_1fr] items-center gap-3 rounded-xl border bg-card px-3 py-2">
          <Label htmlFor="bookingStart" className="text-muted-foreground">
            Начало
          </Label>
          <Input
            id="bookingStart"
            type="time"
            step={300}
            value={startTime}
            onChange={(event) => updateStartTime(event.target.value)}
            onInput={(event) => updateStartTime(event.currentTarget.value)}
            required
            className="h-9 border-0 bg-transparent px-0 text-right text-lg font-semibold shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="grid grid-cols-[104px_1fr] items-center gap-3 rounded-xl border bg-card px-3 py-2">
          <Label htmlFor="bookingEnd" className="text-muted-foreground">
            Окончание
          </Label>
          <Input
            id="bookingEnd"
            type="time"
            step={300}
            value={slot.endTime}
            onChange={(event) => updateEndTime(event.target.value)}
            onInput={(event) => updateEndTime(event.currentTarget.value)}
            required
            className="h-9 border-0 bg-transparent px-0 text-right text-lg font-semibold shadow-none focus-visible:ring-0"
          />
        </div>
      </div>

      <div className="grid gap-3 rounded-xl border bg-card p-3">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium">
            <Clock3 data-icon="inline-start" />
            Длительность
          </div>
          <output className="text-lg font-semibold tabular-nums">
            {formatDuration(safeDuration)}
          </output>
        </div>
        <input
          type="range"
          min={60}
          max={durationMax}
          step={5}
          value={safeDuration}
          onChange={(event) => setDurationMinutes(Number(event.target.value))}
          onInput={(event) => setDurationMinutes(Number(event.currentTarget.value))}
          className="duration-range"
          aria-label="Длительность записи"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>1 ч</span>
          <span>{durationMax === 90 ? "1 ч 30 мин" : "2 ч"}</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            variant="outline"
            aria-label="Уменьшить длительность на 5 минут"
            onClick={() => setDurationMinutes(Math.max(60, safeDuration - 5))}
            disabled={safeDuration <= 60}
          >
            <Minus data-icon="inline-start" />5 мин
          </Button>
          <Button
            type="button"
            variant="outline"
            aria-label="Увеличить длительность на 5 минут"
            onClick={() =>
              setDurationMinutes(Math.min(durationMax, safeDuration + 5))
            }
            disabled={safeDuration >= durationMax}
          >
            <Plus data-icon="inline-start" />5 мин
          </Button>
        </div>
        {durationMax === 90 && (
          <p className="text-xs leading-5 text-muted-foreground">
            После 18:00 правила ограничивают запись 1 часом 30 минутами.
          </p>
        )}
      </div>

    </div>
  );
}

function getInitialSlot() {
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 30) * 30, 0, 0);

  if (now.getHours() >= 22) {
    now.setDate(now.getDate() + 1);
    now.setHours(9, 0, 0, 0);
  }

  return {
    date: formatDateInput(now),
    startTime: formatTimeInput(now),
  };
}

function getMaxDurationForStart(startTime: string) {
  const hour = Number(startTime.slice(0, 2));
  return hour >= 18 ? 90 : 120;
}

function addDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateInput(value: Date) {
  return [
    value.getFullYear(),
    pad2(value.getMonth() + 1),
    pad2(value.getDate()),
  ].join("-");
}

function formatTimeInput(value: Date) {
  return `${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}
