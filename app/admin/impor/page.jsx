import NavAdmin from "@/components/NavAdmin";
import { imporProdukCSV } from "@/app/admin/actions";

export default async function HalamanImporProduk({ searchParams }) {
  const params = await searchParams;
  return <div className="flex flex-col gap-6 py-8"><NavAdmin /><div><h1 className="text-2xl font-extrabold">Impor produk CSV</h1><p className="mt-1 text-sm text-teks-lembut">Maksimal 500 baris dan 2 MB. Kolom wajib: nama, harga.</p></div>{params?.error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-bahaya">{params.error}</p> : null}{params?.success ? <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-utama">✓ {params.success}</p> : null}{params?.detail ? <p role="alert" className="rounded-xl bg-harga-latar px-4 py-3 text-harga">Baris yang ditolak: {params.detail}</p> : null}<section className="rounded-2xl border border-garis bg-latar p-5"><form action={imporProdukCSV} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4"><input required type="file" name="file" accept=".csv,text/csv" className="rounded-lg border border-garis px-3 py-2.5" /><p className="text-sm text-teks-lembut">Kolom opsional: kategori, deskripsi, foto_url, status, harga_diskon, badge, aktif.</p><button className="self-start rounded-lg bg-utama px-4 py-2.5 font-semibold text-white">Impor CSV</button></form></section></div>;
}
