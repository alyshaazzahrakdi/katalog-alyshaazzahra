import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

export function createSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key || key === process.env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Konfigurasi Supabase admin belum lengkap.");
  }
  return createClient(normalizeSupabaseUrl(url), key, { auth: { autoRefreshToken: false, persistSession: false } });
}
