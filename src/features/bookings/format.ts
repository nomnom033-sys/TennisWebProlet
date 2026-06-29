import { format } from "date-fns";
import { ru } from "date-fns/locale";

import type { ExistingBooking } from "./domain";
import { courtName } from "@/lib/site-data";

export function formatBookingMessage(booking: Pick<ExistingBooking, "startAt" | "endAt" | "courtId">) {
  const startAt = new Date(booking.startAt);
  const endAt = new Date(booking.endAt);
  const date = format(startAt, "dd.MM EEEE", { locale: ru });
  const time = `${format(startAt, "HHmm")}-${format(endAt, "HHmm")}`;
  const court = courtName(booking.courtId);

  return `${date}\n${time}\n${court}`;
}

export function formatCancellationMessage(
  booking: Pick<ExistingBooking, "startAt" | "endAt" | "courtId">,
) {
  return `Отмена\n${formatBookingMessage(booking)}`;
}

export function formatDisplayTime(startAt: string, endAt: string) {
  return `${format(new Date(startAt), "HH:mm")}-${format(new Date(endAt), "HH:mm")}`;
}
