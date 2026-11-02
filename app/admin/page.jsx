import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerAuthClient } from "@/lib/supabase/auth";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pilihanUkuran = [10, 15, 50, 100];
  const ukuran = pilihanUkuran.includes(Number(params?.ukuran)) ? Number(params.ukuran) : 10;
  const nomorHalamanDiminta = Math.max(1, Number.parseInt(params?.halaman, 10) || 1);
  const supabase = await createServerAuthClient();
  const { count, error: countError } = await supabase
    .from("produk")
    .select("id", { count: "exact", head: true });

  if (countError) {
    throw countError;
  }

  const jumlahHalaman = Math.max(1, Math.ceil((count ?? 0) / ukuran));
  const nomorHalaman = Math.min(nomorHalamanDiminta, jumlahHalaman);
  const awal = (nomorHalaman - 1) * ukuran;
  const akhir = awal + ukuran - 1;
  const { data: daftarProduk, error } = await supabase
    .from("produk")
    .select("*")
    .order("created_at", { ascending: false })
    .range(awal, akhir);

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
      {typeof params?.error === "string" ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-bahaya">
          {params.error}
        </p>
      ) : null}
      {typeof params?.success === "string" ? (
        <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-utama">
          {params.success}
        </p>
      ) : null}
      <TabelProduk daftarProduk={daftarProduk ?? []} />
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <form className="flex items-center gap-2" method="get">
          <label htmlFor="ukuran">Tampilkan</label>
          <select
            id="ukuran"
            name="ukuran"
            defaultValue={String(ukuran)}
            className="rounded-lg border border-garis bg-latar px-3 py-2"
            onChange={(event) => event.currentTarget.form?.requestSubmit()}
          >
            {pilihanUkuran.map((nilai) => (
              <option key={nilai} value={nilai}>{nilai}</option>
            ))}
          </select>
          <input type="hidden" name="halaman" value="1" />
          <span>data per halaman</span>
        </form>
        <div className="flex items-center gap-3">
          <span className="text-teks-lembut">
            Halaman {nomorHalaman} dari {jumlahHalaman}
          </span>
          {nomorHalaman > 1 ? (
            <a href={`/admin?ukuran=${ukuran}&halaman=${nomorHalaman - 1}`} className="font-semibold hover:text-utama">
              Sebelumnya
            </a>
          ) : null}
          {nomorHalaman < jumlahHalaman ? (
            <a href={`/admin?ukuran=${ukuran}&halaman=${nomorHalaman + 1}`} className="font-semibold hover:text-utama">
              Berikutnya
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
