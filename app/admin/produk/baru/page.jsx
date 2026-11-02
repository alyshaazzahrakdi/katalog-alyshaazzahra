import NavAdmin from "@/components/NavAdmin";
import FormProduk from "@/components/FormProduk";
import { tambahProdukAdmin } from "@/app/admin/actions";

export default async function HalamanTambahProduk({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";
  const pesanSukses = typeof params?.success === "string" ? params.success : "";
  const fieldNames = ["nama", "harga", "kategori", "foto_url", "foto_urls", "varian", "status", "harga_diskon", "badge", "deskripsi"];
  const nilaiForm = Object.fromEntries(fieldNames.filter((field) => typeof params?.[field] === "string").map((field) => [field, params[field]]));
  const errors = Object.fromEntries(fieldNames.filter((field) => typeof params?.[`error_${field}`] === "string").map((field) => [field, params[`error_${field}`]]));

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <h1 className="text-2xl font-extrabold">Tambah produk</h1>
      <FormProduk labelTombol="Simpan produk" action={tambahProdukAdmin} nilaiForm={nilaiForm} errors={errors} />
      {pesanError ? (
        <p role="alert" className="text-bahaya">
          {pesanError}
        </p>
      ) : null}
      {pesanSukses ? <p className="text-utama">{pesanSukses}</p> : null}
    </div>
  );
}
