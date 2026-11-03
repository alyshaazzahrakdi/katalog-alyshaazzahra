import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import GambarProduk from "@/components/GambarProduk";
import { TombolTambahKeranjang } from "@/components/Keranjang";
import TombolFavorit from "@/components/TombolFavorit";
import TombolBandingkan from "@/components/TombolBandingkan";
import { slugKategori } from "@/lib/kategori";

export default function KartuProduk({ produk }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-garis bg-latar shadow-sm transition duration-300 hover:-translate-y-1 hover:border-utama/40 hover:shadow-[0_16px_35px_rgba(31,107,79,0.12)]">
      <div className="relative aspect-[4/3] overflow-hidden bg-permukaan">
        <Link href={`/produk/${produk.id}`} className="block h-full">
          <GambarProduk produk={produk} alt={produk.nama} className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105" />
        </Link>
        {produk.badge ? <span className="absolute right-2 top-2 max-w-[55%] truncate rounded-full bg-harga-latar px-2 py-1 text-[10px] font-bold text-harga sm:right-3 sm:top-3 sm:px-3 sm:text-[11px]">{produk.badge}</span> : null}
        {produk.kategori ? (
          <Link href={`/kategori/${slugKategori(produk.kategori)}`} className="absolute left-2 top-2 max-w-[55%] truncate rounded-full bg-latar/90 px-2 py-1 text-[10px] font-bold text-utama shadow-sm sm:left-3 sm:top-3 sm:px-3 sm:text-[11px]">
            {produk.kategori}
          </Link>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3 p-3 sm:p-4">
        <div className="flex min-w-0 flex-col items-stretch gap-2 min-[400px]:flex-row min-[400px]:items-start min-[400px]:justify-between"><h3 className="min-w-0 break-words font-bold leading-snug transition-colors group-hover:text-utama">{produk.nama}</h3><TombolFavorit id={produk.id} /></div>
        <div className="mt-auto flex min-w-0 flex-wrap items-center justify-between gap-2">
          <div className="min-w-0"><p className="truncate text-sm font-extrabold text-harga">{formatRupiah(produk.harga_diskon || produk.harga)}</p>{produk.harga_diskon ? <del className="text-xs text-teks-lembut">{formatRupiah(produk.harga)}</del> : null}</div>
          <Link href={`/produk/${produk.id}`} className="text-right text-xs font-semibold text-teks-lembut transition-colors hover:text-utama">
            Lihat detail →
          </Link>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-2 min-[640px]:grid-cols-[minmax(0,1fr)_auto] min-[640px]:items-center">
          {produk.status !== "habis" ? <TombolTambahKeranjang produk={produk} /> : <span className="text-sm font-bold text-bahaya">Habis</span>}
          <TombolBandingkan produk={produk} />
        </div>
      </div>
    </div>
  );
}
