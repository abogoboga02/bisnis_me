import "server-only";

import { createClient } from "@supabase/supabase-js";

function getSchema() {
  return process.env.SUPABASE_DB_SCHEMA ?? process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? "bisnis_me";
}

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY atau NEXT_PUBLIC_SUPABASE_ANON_KEY wajib diisi.",
    );
  }

  return createClient(url, key, {
    db: { schema: getSchema() },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
