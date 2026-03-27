import { createClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseSchema, getSupabaseUrl } from "@/lib/supabase-config";

const supabaseUrl = getSupabaseUrl() || "https://placeholder.invalid";
const supabaseAnonKey = getSupabaseAnonKey() || "placeholder-anon-key";
const supabaseSchema = getSupabaseSchema();

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: supabaseSchema },
  auth: { persistSession: false },
});
