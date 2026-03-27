import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.invalid";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
const supabaseSchema =
  process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? process.env.SUPABASE_DB_SCHEMA ?? "bisnis_me";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: supabaseSchema },
  auth: { persistSession: false },
});
