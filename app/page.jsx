import KartuProduk from "@/components/KartuProduk";
import { ambilPengaturanToko } from "@/lib/toko-server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import TerakhirDilihat from "@/components/TerakhirDilihat";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const toko = await ambilPengaturanToko();
  const cari = typeof params?.cari === "string" ? params.cari.trim() : "";
  const kategori = typeof params?.kategori === "string" ? params.kategori.trim() : "";
  const urutkan = ["terbaru", "termurah", "termahal"].includes(params?.urutkan) ? params.urutkan : "terbaru";
  const ukuranHalaman = 12;
  const halamanDiminta = Math.max(1, Number.parseInt(params?.halaman, 10) || 1);
  let daftarProduk = [];
  let daftarKategori = [];
  let totalProduk = 0;
  let jumlahHalaman = 1;
  let halaman = 1;
  let pesanError = "";
  let banner = null;

  try {
    const supabase = createServerSupabaseClient();
    const { data: bannerAktif } = await supabase.from("banner_promo").select("*").eq("aktif", true).order("updated_at", { ascending: false }).limit(1).maybeSingle();
    banner = bannerAktif;
    const query = supabase.from("produk").select("*").eq("aktif", true);
    if (cari) query.ilike("nama", `%${cari}%`);
    if (kategori) query.eq("kategori", kategori);
    const countQuery = supabase.from("produk").select("id", { count: "exact", head: true }).eq("aktif", true);
    if (cari) countQuery.ilike("nama", `%${cari}%`);
    if (kategori) countQuery.eq("kategori", kategori);
    const { count, error: countError } = await countQuery;
    if (countError) throw countError;
    totalProduk = count ?? 0;
    jumlahHalaman = Math.max(1, Math.ceil(totalProduk / ukuranHalaman));
    halaman = Math.min(halamanDiminta, jumlahHalaman);
    const awal = (halaman - 1) * ukuranHalaman;
    const { data, error } = await query
      .order(urutkan === "termurah" || urutkan === "termahal" ? "harga" : "urutan", { ascending: urutkan !== "termahal" })
      .order("created_at", { ascending: false })
      .range(awal, awal + ukuranHalaman - 1);

    if (error) {
      throw error;
    }

    daftarProduk = data ?? [];
    daftarKategori = [...new Set(daftarProduk.map((produk) => produk.kategori).filter(Boolean))].sort();
  } catch (error) {
    pesanError = "Produk belum dapat dimuat. Silakan coba lagi beberapa saat.";
  }

  return (
    <>
      {banner ? <section className="my-6 rounded-2xl bg-harga-latar p-5"><h2 className="text-2xl font-extrabold text-harga">{banner.judul}</h2><p className="mt-1">{banner.teks}</p>{banner.tautan ? <a className="mt-3 inline-block font-bold text-utama" href={banner.tautan}>Lihat promo →</a> : null}</section> : null}
      <section className="relative my-6 overflow-hidden rounded-[2rem] bg-utama px-6 py-10 text-white sm:my-10 sm:px-10 sm:py-14">
        <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border-[34px] border-white/10" />
        <div className="absolute -bottom-32 -left-20 h-64 w-64 rounded-full bg-utama-gelap/50" />
        <div className="relative max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Pilihan terbaik untuk harimu</p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
            {toko.nama}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">{toko.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
            <span className="rounded-full bg-white/15 px-4 py-2">{toko.jamBuka}</span>
            <span className="rounded-full bg-white px-4 py-2 text-utama">Pesan via WhatsApp</span>
          </div>
        </div>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6 pb-12 sm:pb-16">
        <div className="flex min-w-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-utama">Koleksi kami</p>
            <h2 id="judul-produk" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Temukan favoritmu
            </h2>
          </div>
          <form method="get" className="grid min-w-0 gap-3 rounded-2xl border border-garis bg-permukaan p-3 sm:grid-cols-2 sm:p-4 lg:flex-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:max-w-3xl">
            <input name="cari" defaultValue={cari} placeholder="Cari nama produk..." className="min-w-0 w-full rounded-lg border border-garis bg-latar px-3 py-2.5 sm:col-span-2 lg:col-span-1" />
            <select name="kategori" defaultValue={kategori} className="min-w-0 w-full rounded-lg border border-garis bg-latar px-3 py-2.5">
              <option value="">Semua kategori</option>
              {daftarKategori.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select name="urutkan" defaultValue={urutkan} className="min-w-0 w-full rounded-lg border border-garis bg-latar px-3 py-2.5">
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
            </select>
            <button type="submit" className="w-full rounded-lg bg-utama px-4 py-2.5 font-semibold text-white sm:col-span-2 lg:col-span-1">Terapkan</button>
          </form>
          {daftarProduk.length > 0 ? (
            <span className="text-sm text-teks-lembut lg:whitespace-nowrap">{totalProduk} produk tersedia</span>
          ) : null}
        </div>
        {pesanError ? (
          <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-bahaya">
            {pesanError}
          </p>
        ) : daftarProduk.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-garis bg-permukaan px-6 py-10 text-center text-teks-lembut">
            Belum ada produk
          </p>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:gap-6 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
        {jumlahHalaman > 1 ? (
          <nav aria-label="Navigasi halaman katalog" className="flex flex-wrap items-center justify-center gap-3 text-sm">
            {halaman > 1 ? (
              <a href={`/?cari=${encodeURIComponent(cari)}&kategori=${encodeURIComponent(kategori)}&urutkan=${urutkan}&halaman=${halaman - 1}`} className="rounded-lg border border-garis px-4 py-2 font-semibold hover:border-utama hover:text-utama">
                Sebelumnya
              </a>
            ) : null}
            <span className="text-teks-lembut">Halaman {halaman} dari {jumlahHalaman}</span>
            {halaman < jumlahHalaman ? (
              <a href={`/?cari=${encodeURIComponent(cari)}&kategori=${encodeURIComponent(kategori)}&urutkan=${urutkan}&halaman=${halaman + 1}`} className="rounded-lg border border-garis px-4 py-2 font-semibold hover:border-utama hover:text-utama">
                Berikutnya
              </a>
            ) : null}
          </nav>
        ) : null}
        <TerakhirDilihat />
      </section>
    </>
  );
}
