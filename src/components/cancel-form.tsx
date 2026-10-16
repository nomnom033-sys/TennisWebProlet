"use client";

import { useActionState } from "react";
import { useEffect } from "react";

import { cancelBookingStateAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { clearStoredCancelLink } from "@/features/bookings/cancel-link-storage";

type CancelState = {
  ok: boolean;
  message: string;
};

const initialState: CancelState = {
  ok: false,
  message: "",
};

const STORED_CANCEL_LINK_EVENT = "prolettennis:cancel-link-change";

export function CancelForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    cancelBookingStateAction,
    initialState,
  );

  useEffect(() => {
    if (!state.ok) return;

    clearStoredCancelLink(window.localStorage, window.location.href);
    window.dispatchEvent(new Event(STORED_CANCEL_LINK_EVENT));
  }, [state.ok]);

  return (
    <form action={formAction} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertTitle>{state.ok ? "Отменено" : "Не получилось"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Отменяем..." : "Отменить запись"}
      </Button>
    </form>
  );
}
