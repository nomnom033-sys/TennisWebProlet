export type CourtId = "proletarsky" | "obukhovo";

export type BookingStatus = "planned" | "current" | "played" | "cancelled";

export type ExistingBooking = {
  id: string;
  courtId: CourtId;
  startAt: string;
  endAt: string;
  status: BookingStatus;
  playerName: string;
  telegramUsername?: string | null;
  phone?: string | null;
};

export type BookingInput = {
  courtId: CourtId;
  startAt: string;
  endAt: string;
  playerName: string;
  telegramUsername?: string;
  phone?: string;
  phonePublic: boolean;
};

export type PlannedBooking = BookingInput & {
  status: Exclude<BookingStatus, "cancelled">;
  needsAdminReview: boolean;
  publicContact: string | null;
};

export type BookingValidationCode =
  | "invalid_court"
  | "missing_player_name"
  | "invalid_time_range"
  | "outside_booking_window"
  | "slot_too_long"
  | "overlapping_booking"
  | "too_many_active_bookings";

export type BookingValidationIssue = {
  code: BookingValidationCode;
  message: string;
};

export type PlanBookingResult =
  | { ok: true; booking: PlannedBooking; warnings: BookingValidationIssue[] }
  | { ok: false; issues: BookingValidationIssue[] };

type PlanBookingArgs = {
  now: Date;
  existingBookings: ExistingBooking[];
  input: BookingInput;
};

const BOOKING_WINDOW_DAYS = 7;
const BOOKING_TIME_ZONE = "Europe/Moscow";
const EVENING_HOUR = 18;

export function planBooking({
  now,
  existingBookings,
  input,
}: PlanBookingArgs): PlanBookingResult {
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  const playerName = input.playerName.trim();
  const telegramUsername = normalizeTelegramUsername(input.telegramUsername);
  const phone = normalizeOptional(input.phone);
  const issues: BookingValidationIssue[] = [];
  const warnings: BookingValidationIssue[] = [];
  let needsAdminReview = false;

  if (!playerName) {
    issues.push({
      code: "missing_player_name",
      message: "Укажите имя, которое будет видно в расписании.",
    });
  }

  if (!isValidDate(startAt) || !isValidDate(endAt) || endAt <= startAt) {
    issues.push({
      code: "invalid_time_range",
      message: "Выберите корректное время начала и окончания записи.",
    });
  }

  if (isValidDate(startAt) && isAfterBookingWindow(input.startAt, now)) {
    issues.push({
      code: "outside_booking_window",
      message: "Запись доступна на 7 календарных дней вперёд включительно.",
    });
  }

  if (isValidDate(startAt) && isValidDate(endAt) && endAt > startAt) {
    const maxDurationHours = startAt.getHours() >= EVENING_HOUR ? 1.5 : 2;
    const durationHours = (endAt.getTime() - startAt.getTime()) / (60 * 60 * 1000);

    if (durationHours > maxDurationHours) {
      issues.push({
        code: "slot_too_long",
        message:
          startAt.getHours() >= EVENING_HOUR
            ? "После 18:00 запись не может быть длиннее 1,5 часов."
            : "До 18:00 запись не может быть длиннее 2 часов.",
      });
    }

    if (
      existingBookings.some(
        (booking) =>
          booking.status !== "cancelled" &&
          booking.courtId === input.courtId &&
          intervalsOverlap(startAt, endAt, new Date(booking.startAt), new Date(booking.endAt)),
      )
    ) {
      issues.push({
        code: "overlapping_booking",
        message: "На этот корт уже есть запись, которая пересекается по времени.",
      });
    }
  }

  const identityMatchCount = countActiveIdentityMatches(
    existingBookings,
    {
      playerName,
      telegramUsername,
      phone,
    },
    now,
  );

  if (identityMatchCount >= 2) {
    const issue = {
      code: "too_many_active_bookings" as const,
      message: "По правилам одновременно допускается не больше 2 активных записей.",
    };

    if (telegramUsername || phone) {
      issues.push(issue);
    } else {
      warnings.push(issue);
      needsAdminReview = true;
    }
  } else if (!telegramUsername && !phone) {
    needsAdminReview = true;
  }

  if (issues.length > 0) {
    return { ok: false, issues };
  }

  const booking: PlannedBooking = {
    ...input,
    playerName,
    telegramUsername,
    phone,
    status: classifyBookingStatus({
      status: "planned",
      startAt: input.startAt,
      endAt: input.endAt,
      at: now,
    }) as Exclude<BookingStatus, "cancelled">,
    needsAdminReview,
    publicContact: telegramUsername ? `@${telegramUsername}` : null,
  };

  return { ok: true, booking, warnings };
}

export function classifyBookingStatus({
  status,
  startAt,
  endAt,
  at,
}: {
  status: BookingStatus;
  startAt: string;
  endAt: string;
  at: Date;
}): BookingStatus {
  if (status === "cancelled") return "cancelled";

  const start = new Date(startAt);
  const end = new Date(endAt);

  if (start <= at && at < end) return "current";
  if (end <= at) return "played";
  return "planned";
}

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

function isAfterBookingWindow(startAt: string, now: Date) {
  const startDate = startAt.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  if (!startDate) return false;

  return (
    startDate >
    addDaysToDateKey(formatDateInBookingTimeZone(now), BOOKING_WINDOW_DAYS)
  );
}

function formatDateInBookingTimeZone(value: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(value);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

function addDaysToDateKey(dateKey: string, days: number) {
  const next = new Date(`${dateKey}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) {
  return startA < endB && startB < endA;
}

function countActiveIdentityMatches(
  bookings: ExistingBooking[],
  identity: {
    playerName: string;
    telegramUsername?: string;
    phone?: string;
  },
  at: Date,
) {
  return bookings.filter((booking) => {
    const computedStatus = classifyBookingStatus({
      status: booking.status,
      startAt: booking.startAt,
      endAt: booking.endAt,
      at,
    });

    if (computedStatus === "cancelled" || computedStatus === "played") {
      return false;
    }

    const sameTelegram =
      identity.telegramUsername &&
      normalizeTelegramUsername(booking.telegramUsername ?? undefined) ===
        identity.telegramUsername;
    const samePhone =
      identity.phone && normalizeOptional(booking.phone ?? undefined) === identity.phone;
    const sameNameWithoutContact =
      !identity.telegramUsername &&
      !identity.phone &&
      booking.playerName.trim().toLocaleLowerCase("ru-RU") ===
        identity.playerName.toLocaleLowerCase("ru-RU");

    return Boolean(sameTelegram || samePhone || sameNameWithoutContact);
  }).length;
}

function normalizeTelegramUsername(value?: string) {
  const normalized = normalizeOptional(value)?.replace(/^@/, "");
  return normalized ?? undefined;
}

function normalizeOptional(value?: string) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}
