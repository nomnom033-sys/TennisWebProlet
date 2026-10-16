import { z } from "zod";

import type { BookingInput } from "./domain";

const courtIds = ["proletarsky", "obukhovo"] as const;

const optionalTrimmedString = z.preprocess((value) => {
  const normalized = typeof value === "string" ? value.trim() : "";
  return normalized ? normalized : undefined;
}, z.string().optional());

export const bookingFormSchema = z.object({
  courtId: z.enum(courtIds, { error: "Выберите корректный корт." }),
  startAt: z.string().trim().min(1, "Укажите время начала."),
  endAt: z.string().trim().min(1, "Укажите время окончания."),
  playerName: z
    .string()
    .trim()
    .min(1, "Укажите имя, которое будет видно в расписании.")
    .max(80, "Имя не должно быть длиннее 80 символов."),
  telegramUsername: optionalTrimmedString,
  phone: optionalTrimmedString,
  phonePublic: z.preprocess(
    (value) => value === "on" || value === "true",
    z.boolean(),
  ),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export type ParseBookingFormDataResult =
  | { ok: true; input: BookingInput }
  | { ok: false; issues: string[] };

export function parseBookingFormData(
  formData: FormData,
): ParseBookingFormDataResult {
  const result = bookingFormSchema.safeParse({
    courtId: formData.get("courtId"),
    startAt: formData.get("startAt"),
    endAt: formData.get("endAt"),
    playerName: formData.get("playerName"),
    telegramUsername: formData.get("telegramUsername"),
    phone: formData.get("phone"),
    phonePublic: formData.get("phonePublic"),
  });

  if (!result.success) {
    return {
      ok: false,
      issues: result.error.issues.map((issue) => issue.message),
    };
  }

  return {
    ok: true,
    input: result.data,
  };
}
