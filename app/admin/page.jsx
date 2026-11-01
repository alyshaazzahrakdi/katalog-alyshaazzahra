import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerAuthClient } from "@/lib/supabase/auth";

export default async function HalamanAdmin() {
  const supabase = await createServerAuthClient();
  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>
      <TabelProduk daftarProduk={daftarProduk ?? []} />
    </div>
  );
}
