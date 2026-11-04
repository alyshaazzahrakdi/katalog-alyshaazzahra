import NavAdmin from "@/components/NavAdmin";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { tambahKategori, ubahKategori, hapusKategori } from "@/app/admin/actions";

export default async function HalamanKategori({ searchParams }) {
  const params = await searchParams;
  const supabase = await createServerAuthClient();
  const { data: kategori, error } = await supabase
    .from("kategori")
    .select("id,nama,created_at")
    .order("nama");
  if (error) throw error;

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div>
        <h1 className="text-2xl font-extrabold">Kelola kategori</h1>
        <p className="mt-1 text-sm text-teks-lembut">Kategori dipakai sebagai pilihan pada form produk.</p>
      </div>
      {params?.error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-bahaya">{params.error}</p> : null}
      {params?.success ? <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-utama">{params.success}</p> : null}
      <section className="rounded-2xl border border-garis bg-latar p-5">
        <h2 className="font-extrabold">Tambah kategori</h2>
        <form action={tambahKategori} className="mt-4 flex max-w-xl gap-3">
          <input required minLength="2" maxLength="80" name="nama" placeholder="Nama kategori" className="min-w-0 flex-1 rounded-lg border border-garis px-3 py-2.5" />
          <button className="rounded-lg bg-utama px-4 py-2.5 font-semibold text-white">Tambah</button>
        </form>
      </section>
      <section className="overflow-x-auto rounded-2xl border border-garis">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="bg-permukaan"><tr><th className="px-4 py-3">Nama kategori</th><th className="px-4 py-3">Aksi</th></tr></thead>
          <tbody>
            {(kategori ?? []).map((item) => (
              <tr key={item.id} className="border-t border-garis">
                <td className="px-4 py-3 font-semibold">{item.nama}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <form action={ubahKategori.bind(null, item.id)} className="flex gap-2">
                      <input required minLength="2" maxLength="80" name="nama" defaultValue={item.nama} className="rounded-lg border border-garis px-3 py-2" aria-label={`Nama kategori ${item.nama}`} />
                      <button className="rounded-lg border border-garis px-3 py-2 font-semibold">Simpan</button>
                    </form>
                    <form action={hapusKategori.bind(null, item.id)}>
                      <button className="rounded-lg border border-garis px-3 py-2 font-semibold text-bahaya">Hapus</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!kategori?.length ? <p className="p-5 text-sm text-teks-lembut">Belum ada kategori. Jalankan migrasi kategori untuk mengimpor kategori dari produk lama.</p> : null}
      </section>
    </div>
  );
}
