import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { urlFotoTampil } from "@/lib/foto";
import { TombolTambahKeranjang } from "@/components/Keranjang";

export default function KartuProduk({ produk }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-garis bg-latar shadow-sm transition duration-300 hover:-translate-y-1 hover:border-utama/40 hover:shadow-[0_16px_35px_rgba(31,107,79,0.12)]">
      <Link href={`/produk/${produk.id}`}>
      <div className="relative aspect-[4/3] overflow-hidden bg-permukaan">
        <img
          src={urlFotoTampil(produk.foto_url)}
          alt={produk.nama}
          className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
        />
        {produk.badge ? <span className="absolute right-3 top-3 rounded-full bg-harga-latar px-3 py-1 text-[11px] font-bold text-harga">{produk.badge}</span> : null}
        {produk.kategori ? (
          <span className="absolute left-3 top-3 rounded-full bg-latar/90 px-3 py-1 text-[11px] font-bold text-utama shadow-sm">
            {produk.kategori}
          </span>
        ) : null}
      </div>
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-bold leading-snug transition-colors group-hover:text-utama">{produk.nama}</h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <div><p className="text-sm font-extrabold text-harga">{formatRupiah(produk.harga_diskon || produk.harga)}</p>{produk.harga_diskon ? <del className="text-xs text-teks-lembut">{formatRupiah(produk.harga)}</del> : null}</div>
          <span className="text-xs font-semibold text-teks-lembut transition-colors group-hover:text-utama">
            Lihat detail →
          </span>
        </div>
        {produk.status !== "habis" ? <TombolTambahKeranjang produk={produk} /> : <span className="text-sm font-bold text-bahaya">Habis</span>}
      </div>
    </div>
  );
}
