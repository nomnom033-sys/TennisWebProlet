import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/env";

type CookieStore = Awaited<ReturnType<typeof cookies>>;

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(
    getSupabaseUrl()!,
    getSupabaseAnonKey()!,
    {
      cookies: createSupabaseCookieMethods(cookieStore),
    },
  );
}

export function createSupabaseCookieMethods(cookieStore: CookieStore) {
  return {
    getAll() {
      return cookieStore.getAll();
    },
    setAll(
      cookiesToSet: Parameters<
        NonNullable<
          Parameters<typeof createServerClient>[2]["cookies"]["setAll"]
        >
      >[0],
    ) {
      cookiesToSet.forEach(({ name, value, options }) => {
        try {
          cookieStore.set(name, value, options);
        } catch (error) {
          if (!isReadOnlyServerComponentCookieError(error)) {
            throw error;
          }
        }
      });
    },
  };
}

function isReadOnlyServerComponentCookieError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes(
      "Cookies can only be modified in a Server Action or Route Handler",
    )
  );
}
