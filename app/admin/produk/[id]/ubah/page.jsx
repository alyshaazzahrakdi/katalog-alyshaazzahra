import { notFound } from "next/navigation";
import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { ubahProdukAdmin } from "@/app/admin/actions";
import { createServerAuthClient } from "@/lib/supabase/auth";

export default async function HalamanUbahProduk({ params, searchParams }) {
  const { id } = await params;
  const query = await searchParams;
  const pesanError = typeof query?.error === "string" ? query.error : "";
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

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Ubah produk</h1>
      <FormProduk
        produk={produk}
        labelTombol="Simpan perubahan"
        action={ubahProdukAdmin.bind(null, id)}
      />
      {pesanError ? (
        <p role="alert" className="text-bahaya">
          {pesanError}
        </p>
      ) : null}
    </div>
  );
}
