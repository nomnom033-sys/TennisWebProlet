"use client";

import { useActionState } from "react";

import { cancelBookingStateAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type CancelState = {
  ok: boolean;
  message: string;
};

const initialState: CancelState = {
  ok: false,
  message: "",
};

export function CancelForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(
    cancelBookingStateAction,
    initialState,
  );

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
