import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminAuthResult =
  | { ok: true; email: string }
  | {
      ok: false;
      reason: "supabase_not_configured" | "not_signed_in" | "not_allowed";
      message: string;
    };

export async function getCurrentAdmin(): Promise<AdminAuthResult> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return {
      ok: false,
      reason: "supabase_not_configured",
      message: "Supabase Auth не настроен.",
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) {
    return {
      ok: false,
      reason: "not_signed_in",
      message: "Войдите через magic link администратора.",
    };
  }

  const email = user.email.toLocaleLowerCase();
  if (isAdminEmailAllowlisted(email)) {
    return { ok: true, email };
  }

  const adminClient = createSupabaseAdminClient();
  if (adminClient) {
    const { data } = await adminClient
      .from("admin_users")
      .select("email")
      .eq("email", email)
      .maybeSingle();

    if (data?.email) {
      return { ok: true, email };
    }
  }

  return {
    ok: false,
    reason: "not_allowed",
    message: "Этот email не входит в список администраторов.",
  };
}

function isAdminEmailAllowlisted(email: string) {
  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLocaleLowerCase())
    .filter(Boolean);

  return allowlist.includes(email);
}
