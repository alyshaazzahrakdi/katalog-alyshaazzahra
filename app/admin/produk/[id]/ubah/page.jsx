import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProdukAdmin } from "@/app/admin/actions";
import { createServerAuthClient } from "@/lib/supabase/auth";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const pesanError = typeof query?.error === "string" ? query.error : "";
  const pesanSukses = typeof query?.success === "string" ? query.success : "";
  const fieldNames = ["nama", "harga", "kategori", "foto_url", "foto_urls", "varian", "status", "stok", "harga_diskon", "badge", "deskripsi"];
  const nilaiForm = Object.fromEntries(fieldNames.filter((field) => typeof query?.[field] === "string").map((field) => [field, query[field]]));
  const errors = Object.fromEntries(fieldNames.filter((field) => typeof query?.[`error_${field}`] === "string").map((field) => [field, query[`error_${field}`]]));
  const supabase = await createServerAuthClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!produk) {
    notFound();
  }
  const { data: varianProduk, error: varianError } = await supabase.from("varian_produk").select("nama,harga").eq("produk_id", id).order("id");
  if (varianError) throw varianError;
  const { data: kategori, error: kategoriError } = await supabase.from("kategori").select("id,nama").order("nama");
  if (kategoriError) throw kategoriError;
  produk.varian_produk = varianProduk ?? [];

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        nilaiForm={nilaiForm}
        errors={errors}
        labelTombol="Simpan perubahan"
        action={ubahProdukAdmin.bind(null, id)}
        kategori={kategori ?? []}
      />
      {pesanError ? (
        <p role="alert" className="text-bahaya">
          {pesanError}
        </p>
      ) : null}
      {pesanSukses ? <p className="text-utama">{pesanSukses}</p> : null}
    </div>
  );
}
