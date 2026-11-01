import { createClient } from "@supabase/supabase-js";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";

export function createServerSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Konfigurasi Supabase belum lengkap. Periksa SUPABASE_URL dan SUPABASE_SECRET_KEY.");
  }

  if (supabaseSecretKey === process.env.SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("SUPABASE_SECRET_KEY tidak boleh sama dengan SUPABASE_PUBLISHABLE_KEY. Gunakan service_role atau secret key dari Supabase.");
  }

  return createClient(normalizeSupabaseUrl(supabaseUrl), supabaseSecretKey);
}
