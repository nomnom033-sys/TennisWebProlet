import { NextResponse, type NextRequest } from "next/server";

import { normalizeAuthNextPath } from "@/lib/auth-redirect";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = normalizeAuthNextPath(requestUrl.searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();

    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        return NextResponse.redirect(new URL(next, requestUrl.origin));
      }
    }
  }

  const errorUrl = new URL("/admin", requestUrl.origin);
  errorUrl.searchParams.set("auth", "callback-error");
  return NextResponse.redirect(errorUrl);
}
