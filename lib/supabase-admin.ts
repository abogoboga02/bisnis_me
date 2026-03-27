import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseSchema, getSupabaseUrl } from "@/lib/supabase-config";

export function getSupabaseAdmin() {
  const url = getSupabaseUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi.");
  }

  return createClient(url, key, {
    db: { schema: getSupabaseSchema() },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
