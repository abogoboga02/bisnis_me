export function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    ""
  );
}

export function getSupabaseSchema() {
  return process.env.SUPABASE_DB_SCHEMA ?? process.env.NEXT_PUBLIC_SUPABASE_DB_SCHEMA ?? "bisnis_me";
}
