export type BookingSlotInput = {
  date: string;
  startTime: string;
  durationMinutes: number;
};

export type BookingSlot = BookingSlotInput & {
  endTime: string;
  startAt: string;
  endAt: string;
};

const MIN_DURATION_MINUTES = 60;
const MAX_DURATION_MINUTES = 120;

export function clampDurationMinutes(value: number) {
  return Math.min(
    MAX_DURATION_MINUTES,
    Math.max(MIN_DURATION_MINUTES, Math.round(value)),
  );
}

export function formatDuration(durationMinutes: number) {
  const safeMinutes = clampDurationMinutes(durationMinutes);
  const hours = Math.floor(safeMinutes / 60);
  const minutes = safeMinutes % 60;

  if (minutes === 0) return `${hours} ч`;
  return `${hours} ч ${minutes} мин`;
}

export function buildBookingSlot({
  date,
  startTime,
  durationMinutes,
}: BookingSlotInput): BookingSlot {
  const startAt = `${date}T${startTime}`;
  const safeDuration = clampDurationMinutes(durationMinutes);
  const endAt = addMinutesToLocalDateTime(startAt, safeDuration);

  return {
    date,
    startTime,
    durationMinutes: safeDuration,
    endTime: endAt.slice(11, 16),
    startAt,
    endAt,
  };
}

export function addMinutesToLocalDateTime(localDateTime: string, minutes: number) {
  const date = parseLocalDateTime(localDateTime);
  date.setMinutes(date.getMinutes() + minutes);
  return formatLocalDateTime(date);
}

export function minutesBetweenLocalDateTimes(startAt: string, endAt: string) {
  const start = parseLocalDateTime(startAt);
  const end = parseLocalDateTime(endAt);
  return Math.round((end.getTime() - start.getTime()) / 60_000);
}

function parseLocalDateTime(value: string) {
  const [datePart, timePart] = value.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes] = timePart.split(":").map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

function formatLocalDateTime(value: Date) {
  return [
    value.getFullYear(),
    pad2(value.getMonth() + 1),
    pad2(value.getDate()),
  ].join("-") + `T${pad2(value.getHours())}:${pad2(value.getMinutes())}`;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}
