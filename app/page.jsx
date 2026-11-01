import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog() {
  let daftarProduk = [];
  let pesanError = "";

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    daftarProduk = data ?? [];
  } catch (error) {
    pesanError = `Produk belum dapat dimuat. ${error.message}`;
  }

  return (
    <>
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
      </section>
    </>
  );
}
