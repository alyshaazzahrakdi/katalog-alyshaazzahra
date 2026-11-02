import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import TerakhirDilihat from "@/components/TerakhirDilihat";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = await searchParams;
  const cari = typeof params?.cari === "string" ? params.cari.trim() : "";
  const kategori = typeof params?.kategori === "string" ? params.kategori.trim() : "";
  const urutkan = ["terbaru", "termurah", "termahal"].includes(params?.urutkan) ? params.urutkan : "terbaru";
  let daftarProduk = [];
  let daftarKategori = [];
  let pesanError = "";
  let banner = null;

  try {
    const supabase = createServerSupabaseClient();
    const { data: bannerAktif } = await supabase.from("banner_promo").select("*").eq("aktif", true).order("updated_at", { ascending: false }).limit(1).maybeSingle();
    banner = bannerAktif;
    const query = supabase.from("produk").select("*").eq("aktif", true);
    if (cari) query.ilike("nama", `%${cari}%`);
    if (kategori) query.eq("kategori", kategori);
    const kolomUrutan = urutkan === "termurah" || urutkan === "termahal" ? "harga" : "created_at";
    const { data, error } = await query.order(kolomUrutan, { ascending: urutkan !== "termahal" });

    if (error) {
      throw error;
    }

    daftarProduk = data ?? [];
    daftarKategori = [...new Set(daftarProduk.map((produk) => produk.kategori).filter(Boolean))].sort();
  } catch (error) {
    pesanError = `Produk belum dapat dimuat. ${error.message}`;
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
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-utama">Koleksi kami</p>
            <h2 id="judul-produk" className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Temukan favoritmu
            </h2>
          </div>
          <form method="get" className="grid gap-3 rounded-2xl border border-garis bg-permukaan p-4 sm:grid-cols-[1fr_auto_auto_auto]">
            <input name="cari" defaultValue={cari} placeholder="Cari nama produk..." className="rounded-lg border border-garis bg-latar px-3 py-2.5" />
            <select name="kategori" defaultValue={kategori} className="rounded-lg border border-garis bg-latar px-3 py-2.5">
              <option value="">Semua kategori</option>
              {daftarKategori.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
            <select name="urutkan" defaultValue={urutkan} className="rounded-lg border border-garis bg-latar px-3 py-2.5">
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
            </select>
            <button type="submit" className="rounded-lg bg-utama px-4 py-2.5 font-semibold text-white">Terapkan</button>
          </form>
          {daftarProduk.length > 0 ? (
            <span className="hidden text-sm text-teks-lembut sm:block">{daftarProduk.length} produk tersedia</span>
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
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
        <TerakhirDilihat />
      </section>
    </>
  );
}
