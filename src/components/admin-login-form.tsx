"use client";

import { useActionState } from "react";

import { requestAdminMagicLinkStateAction } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AdminLoginState = {
  ok: boolean;
  message: string;
};

const initialState: AdminLoginState = {
  ok: false,
  message: "",
};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(
    requestAdminMagicLinkStateAction,
    initialState,
  );

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email администратора</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      {state.message && (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertTitle>{state.ok ? "Проверьте почту" : "Не получилось"}</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}
      <Button type="submit" disabled={pending}>
        {pending ? "Отправляем..." : "Отправить magic link"}
      </Button>
    </form>
  );
}
