import { createClient } from "@supabase/supabase-js";

import {
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
  isSupabaseServiceConfigured,
} from "@/lib/env";

export function createSupabaseAdminClient() {
  if (!isSupabaseServiceConfigured()) {
    return null;
  }

  return createClient(
    getSupabaseUrl()!,
    getSupabaseServiceRoleKey()!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
