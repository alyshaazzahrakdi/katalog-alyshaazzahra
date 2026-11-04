import { toko } from "@/lib/toko";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { cache } from "react";

export const ambilPengaturanToko = cache(async function ambilPengaturanToko() {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pengaturan_toko")
    .select("nama,tagline,nomor_whatsapp,alamat,jam_buka")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("Pengaturan toko gagal dimuat.");
    return toko;
  }

  return {
    ...toko,
    nama: data?.nama || toko.nama,
    tagline: data?.tagline || toko.tagline,
    nomorWhatsApp: data?.nomor_whatsapp || toko.nomorWhatsApp.replace(/^\+/, ""),
    alamat: data?.alamat || toko.alamat,
    jamBuka: data?.jam_buka || toko.jamBuka,
  };
});
