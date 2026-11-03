import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import KartuProduk from "@/components/KartuProduk";
import { formatRupiah } from "@/lib/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { urlFotoTampil } from "@/lib/foto";
import GaleriProduk from "@/components/GaleriProduk";
import TombolBagikan from "@/components/TombolBagikan";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";
import CatatProdukDilihat from "@/components/CatatProdukDilihat";
import { kirimUlasan } from "@/app/admin/actions";
import { ambilPengaturanToko } from "@/lib/toko-server";
import { slugKategori } from "@/lib/kategori";
import AsistenProduk from "@/components/AsistenProduk";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) return { title: "Produk tidak ditemukan" };
  const { data: produk } = await createServerSupabaseClient().from("produk").select("nama, deskripsi, foto_url").eq("id", id).maybeSingle();
  if (!produk) return { title: "Produk tidak ditemukan" };
  const base = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return {
    title: produk.nama,
    description: produk.deskripsi || `Lihat ${produk.nama} di katalog ${base}.`,
    openGraph: { title: produk.nama, description: produk.deskripsi || `Pesan ${produk.nama} sekarang.`, url: `${base}/produk/${id}`, images: produk.foto_url ? [{ url: produk.foto_url, alt: produk.nama }] : [] },
  };
}

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();
  const toko = await ambilPengaturanToko();
  const supabase = createServerSupabaseClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .eq("aktif", true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!produk) {
    notFound();
  }
  const { data: produkTerkait, error: terkaitError } = await supabase
    .from("produk")
    .select("*")
    .eq("kategori", produk.kategori)
    .neq("id", produk.id)
    .order("created_at", { ascending: false })
    .limit(4);
  if (terkaitError) throw terkaitError;
  const { data: varianProduk, error: varianError } = await supabase.from("varian_produk").select("id,nama,harga").eq("produk_id", id).order("id");
  if (varianError) throw varianError;
  produk.varian_produk = varianProduk ?? [];
  const { data: ulasan } = await supabase.from("ulasan").select("id,nama,rating,komentar,created_at").eq("produk_id", id).eq("tampil", true).order("created_at", { ascending: false });
  const rataRata = ulasan?.length ? (ulasan.reduce((sum, item) => sum + item.rating, 0) / ulasan.length).toFixed(1) : null;

  return (
    <article className="py-4 sm:py-6">
      <CatatProdukDilihat produk={produk} />
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-teks-lembut hover:text-utama">
        <span aria-hidden="true">←</span> Kembali ke katalog
      </Link>
      <div className="mt-4 grid overflow-hidden rounded-2xl border border-garis bg-latar shadow-sm md:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="relative min-w-0">
          <GaleriProduk produk={produk} />
          {produk.kategori ? (
            <Link href={`/kategori/${slugKategori(produk.kategori)}`} className="absolute left-4 top-4 rounded-full bg-latar/90 px-3 py-1.5 text-xs font-bold text-utama shadow-sm">
              {produk.kategori}
            </Link>
          ) : null}
        </div>
        <div className="flex min-w-0 flex-col px-5 py-5 sm:px-7 sm:py-7">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-utama">Detail produk</p>
          <div className="mt-2 flex items-start justify-between gap-3"><h1 className="min-w-0 break-words text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">{produk.nama}</h1><TombolFavorit id={produk.id} /></div>
          {produk.badge ? <span className="mt-3 self-start rounded-full bg-harga-latar px-3 py-1 text-xs font-bold text-harga">{produk.badge}</span> : null}
          <p className="mt-4 inline-flex max-w-full flex-wrap items-baseline gap-2 self-start rounded-xl bg-harga-latar px-3 py-2 text-xl font-extrabold text-harga sm:text-2xl">{formatRupiah(produk.harga_diskon || produk.harga)} {produk.harga_diskon ? <del className="text-sm font-semibold text-teks-lembut">{formatRupiah(produk.harga)}</del> : null}</p>
          <p className={`mt-3 text-sm font-bold ${produk.stok > 0 && produk.status !== "habis" ? "text-utama" : "text-bahaya"}`}>
            {produk.stok > 0 && produk.status !== "habis" ? `Stok ready: ${produk.stok} barang` : "Stok habis"}
          </p>
          <div className="my-5 h-px bg-garis" />
          <p className="max-w-prose leading-7 text-teks-lembut">
            {produk.deskripsi || "Produk pilihan dengan kualitas terbaik dari toko kami."}
          </p>
          <div className="mt-5">
            <TombolWhatsApp produk={produk} toko={toko} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><TombolBagikan nama={produk.nama} /><TombolBandingkan produk={produk} /></div>
          <p className="mt-3 text-xs leading-5 text-teks-lembut">
            Anda akan diarahkan ke WhatsApp untuk melanjutkan pemesanan.
          </p>
          <AsistenProduk produkId={produk.id} />
        </div>
      </div>
      <section className="mt-8 rounded-2xl border border-garis bg-latar p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-utama">Percakapan pelanggan</p>
            <h2 className="mt-1 text-2xl font-extrabold">Penilaian produk {rataRata ? <span className="text-harga">★ {rataRata}/5</span> : null}</h2>
          </div>
          <span className="text-sm text-teks-lembut">{ulasan?.length || 0} penilaian</span>
        </div>
        <form action={kirimUlasan} className="mt-5 grid gap-3 sm:max-w-xl">
          <input type="hidden" name="produk_id" value={produk.id} /><input name="website" tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" />
          <input required name="nama" maxLength="80" placeholder="Nama" className="rounded-lg border border-garis px-3 py-2" />
          <select required name="rating" className="rounded-lg border border-garis px-3 py-2"><option value="">Pilih rating</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} bintang</option>)}</select>
          <textarea required name="komentar" maxLength="1000" placeholder="Tulis ulasan..." className="rounded-lg border border-garis px-3 py-2" />
          <button className="rounded-lg bg-utama px-4 py-2 font-semibold text-white">Kirim ulasan</button>
        </form>
        <div className="mt-6 grid gap-3">{(ulasan ?? []).map((item) => <article key={item.id} className="rounded-xl bg-permukaan p-4"><div className="flex flex-wrap items-center justify-between gap-2"><strong>{item.nama}</strong><span className="text-sm text-harga">{"★".repeat(item.rating)} <span className="text-teks-lembut">{item.rating}/5</span></span></div><p className="mt-2 break-words leading-6 text-teks-lembut">{item.komentar}</p></article>)}{!ulasan?.length ? <p className="rounded-xl bg-permukaan p-4 text-teks-lembut">Belum ada penilaian. Jadilah pelanggan pertama yang memberi penilaian.</p> : null}</div>
      </section>
      {produkTerkait?.length ? (
        <section className="mt-10" aria-labelledby="produk-terkait">
          <h2 id="produk-terkait" className="mb-5 text-2xl font-extrabold">Produk terkait</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {produkTerkait.map((item) => <KartuProduk key={item.id} produk={item} />)}
          </div>
        </section>
      ) : null}
    </article>
  );
}
