import Link from "next/link";
import { notFound } from "next/navigation";
import TombolWhatsApp from "@/components/TombolWhatsApp";
import { formatRupiah } from "@/lib/format";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanDetailProduk({ params }) {
  const { id } = await params;
  const supabase = createServerSupabaseClient();
  const { data: produk, error } = await supabase
    .from("produk")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!produk) {
    notFound();
  }

  return (
    <article className="py-6 sm:py-10">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-teks-lembut hover:text-utama">
        <span aria-hidden="true">←</span> Kembali ke katalog
      </Link>
      <div className="mt-6 grid overflow-hidden rounded-[2rem] border border-garis bg-latar shadow-[0_18px_55px_rgba(27,36,32,0.08)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="relative min-h-72 bg-permukaan md:min-h-[520px]">
          <img
            src={produk.foto_url}
            alt={produk.nama}
            className="h-full min-h-72 w-full object-contain p-4 md:min-h-[520px]"
          />
          {produk.kategori ? (
            <span className="absolute left-5 top-5 rounded-full bg-latar/90 px-4 py-2 text-xs font-bold text-utama shadow-sm">
              {produk.kategori}
            </span>
          ) : null}
        </div>
        <div className="flex flex-col justify-center px-6 py-8 sm:px-10 sm:py-12">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-utama">Detail produk</p>
          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">{produk.nama}</h1>
          <p className="mt-6 inline-flex self-start rounded-xl bg-harga-latar px-4 py-2 text-2xl font-extrabold text-harga">
            {formatRupiah(produk.harga)}
          </p>
          <div className="my-8 h-px bg-garis" />
          <p className="max-w-prose leading-7 text-teks-lembut">
            {produk.deskripsi || "Produk pilihan dengan kualitas terbaik dari toko kami."}
          </p>
          <div className="mt-8">
            <TombolWhatsApp produk={produk} />
          </div>
          <p className="mt-4 text-xs leading-5 text-teks-lembut">
            Anda akan diarahkan ke WhatsApp untuk melanjutkan pemesanan.
          </p>
        </div>
      </div>
    </article>
  );
}
