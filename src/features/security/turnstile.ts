import { getTurnstileSecretKey } from "@/lib/env";

export type TurnstileValidationResult =
  | { ok: true; status: "verified" | "skipped" }
  | { ok: false; message: string };

type TurnstileSiteverifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
};

export async function verifyTurnstileToken(
  token: string | undefined,
): Promise<TurnstileValidationResult> {
  const secret = getTurnstileSecretKey();

  if (!secret) {
    return { ok: true, status: "skipped" };
  }

  if (!token) {
    return { ok: false, message: "Подтвердите защиту формы перед записью." };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          secret,
          response: token,
        }),
      },
    );
    const result = (await response.json()) as TurnstileSiteverifyResponse;

    if (response.ok && result.success) {
      return { ok: true, status: "verified" };
    }

    return {
      ok: false,
      message:
        result["error-codes"]?.length
          ? `Проверка защиты формы не прошла: ${result["error-codes"].join(", ")}.`
          : "Проверка защиты формы не прошла.",
    };
  } catch {
    return {
      ok: false,
      message: "Не удалось проверить защиту формы. Попробуйте ещё раз.",
    };
  }
}
