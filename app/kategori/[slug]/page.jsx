import Link from "next/link";
import { notFound } from "next/navigation";
import KartuProduk from "@/components/KartuProduk";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { kategoriDariSlug, slugKategori } from "@/lib/kategori";

export const dynamic = "force-dynamic";

export default async function HalamanKategori({ params }) {
  const { slug } = await params;
  const supabase = createServerSupabaseClient();
  const { data: kategoriRows, error: kategoriError } = await supabase.from("produk").select("kategori").eq("aktif", true).not("kategori", "is", null);
  if (kategoriError) throw kategoriError;
  const kategori = kategoriDariSlug(slug, [...new Set((kategoriRows || []).map((item) => item.kategori).filter(Boolean))]);
  if (!kategori) notFound();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("id,nama,harga,harga_diskon,kategori,foto_url,foto_urls,badge,status,stok,urutan,created_at")
    .eq("aktif", true)
    .eq("kategori", kategori)
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return <section className="py-8 sm:py-12">
    <Link href="/" className="text-sm font-semibold text-teks-lembut hover:text-utama">← Kembali ke katalog</Link>
    <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-utama">Kategori produk</p>
    <h1 className="mt-2 text-4xl font-extrabold">{kategori}</h1>
    <p className="mt-2 text-teks-lembut">{produk?.length || 0} produk dalam kategori ini.</p>
    {produk?.length ? <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">{produk.map((item) => <KartuProduk key={item.id} produk={item} />)}</div> : <p className="mt-8 rounded-2xl border border-dashed border-garis p-8 text-center text-teks-lembut">Belum ada produk dalam kategori ini.</p>}
  </section>;
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return { title: `Kategori ${slug.replaceAll("-", " ")}` };
}
