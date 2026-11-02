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

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
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
  const { data: ulasan } = await supabase.from("ulasan").select("id,nama,rating,komentar,created_at").eq("produk_id", id).eq("tampil", true).order("created_at", { ascending: false });
  const rataRata = ulasan?.length ? (ulasan.reduce((sum, item) => sum + item.rating, 0) / ulasan.length).toFixed(1) : null;

  return (
    <article className="py-6 sm:py-10">
      <CatatProdukDilihat produk={produk} />
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-teks-lembut hover:text-utama">
        <span aria-hidden="true">←</span> Kembali ke katalog
      </Link>
      <div className="mt-6 grid overflow-hidden rounded-[2rem] border border-garis bg-latar shadow-[0_18px_55px_rgba(27,36,32,0.08)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative">
          <GaleriProduk produk={produk} />
          {produk.kategori ? (
            <span className="absolute left-5 top-5 rounded-full bg-latar/90 px-4 py-2 text-xs font-bold text-utama shadow-sm">
              {produk.kategori}
            </span>
          ) : null}
        </div>
        <section className="mt-10 rounded-2xl border border-garis bg-latar p-6">
          <h2 className="text-2xl font-extrabold">Ulasan pelanggan {rataRata ? <span className="text-harga">★ {rataRata}/5</span> : null}</h2>
          <form action={kirimUlasan} className="mt-5 grid gap-3 sm:max-w-xl">
            <input type="hidden" name="produk_id" value={produk.id} /><input name="website" tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" />
            <input required name="nama" maxLength="80" placeholder="Nama" className="rounded-lg border border-garis px-3 py-2" />
            <select required name="rating" className="rounded-lg border border-garis px-3 py-2"><option value="">Pilih rating</option>{[1,2,3,4,5].map((n) => <option key={n} value={n}>{n} bintang</option>)}</select>
            <textarea required name="komentar" maxLength="1000" placeholder="Tulis ulasan..." className="rounded-lg border border-garis px-3 py-2" />
            <button className="rounded-lg bg-utama px-4 py-2 font-semibold text-white">Kirim ulasan</button>
          </form>
          <div className="mt-6 grid gap-4">{(ulasan ?? []).map((item) => <div key={item.id} className="border-t border-garis pt-3"><strong>{item.nama}</strong> <span className="text-harga">{"★".repeat(item.rating)}</span><p className="text-teks-lembut">{item.komentar}</p></div>)}{!ulasan?.length ? <p className="text-teks-lembut">Belum ada ulasan.</p> : null}</div>
        </section>
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-utama">Detail produk</p>
          <div className="flex items-start justify-between gap-3"><h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{produk.nama}</h1><TombolFavorit id={produk.id} /></div>
          {produk.badge ? <span className="mt-4 self-start rounded-full bg-harga-latar px-3 py-1 text-xs font-bold text-harga">{produk.badge}</span> : null}
          <p className="mt-6 inline-flex self-start rounded-xl bg-harga-latar px-4 py-2 text-2xl font-extrabold text-harga">{formatRupiah(produk.harga_diskon || produk.harga)} {produk.harga_diskon ? <del className="ml-2 text-sm font-semibold text-teks-lembut">{formatRupiah(produk.harga)}</del> : null}</p>
          <div className="my-8 h-px bg-garis" />
          <p className="max-w-prose leading-7 text-teks-lembut">
            {produk.deskripsi || "Produk pilihan dengan kualitas terbaik dari toko kami."}
          </p>
          <div className="mt-8">
            <TombolWhatsApp produk={produk} />
          </div>
          <div className="mt-3 flex flex-wrap gap-2"><TombolBagikan nama={produk.nama} /><TombolBandingkan produk={produk} /></div>
          <p className="mt-4 text-xs leading-5 text-teks-lembut">
            Anda akan diarahkan ke WhatsApp untuk melanjutkan pemesanan.
          </p>
        </div>
      </div>
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
