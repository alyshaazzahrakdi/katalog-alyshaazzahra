import { createServerSupabaseClient } from "@/lib/supabase/server";
import DaftarFavorit from "@/components/DaftarFavorit";

export const dynamic = "force-dynamic";

export default async function FavoritPage() {
  const { data = [], error } = await createServerSupabaseClient().from("produk").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return <section className="py-10 sm:py-16"><h1 className="text-3xl font-extrabold">Produk favorit</h1><p className="mt-2 text-teks-lembut">Koleksi produk yang kamu simpan di browser ini.</p><div className="mt-8"><DaftarFavorit produk={data} /></div></section>;
}
