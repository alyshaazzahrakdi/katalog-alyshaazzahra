import Link from "next/link";
import { formatRupiah } from "@/lib/format";

export default function KartuProduk({ produk }) {
  return (
    <Link
      href={`/produk/${produk.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-garis bg-latar shadow-sm transition duration-300 hover:-translate-y-1 hover:border-utama/40 hover:shadow-[0_16px_35px_rgba(31,107,79,0.12)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-permukaan">
        <img
          src={produk.foto_url}
          alt={produk.nama}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        {produk.kategori ? (
          <span className="absolute left-3 top-3 rounded-full bg-latar/90 px-3 py-1 text-[11px] font-bold text-utama shadow-sm">
            {produk.kategori}
          </span>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <h3 className="font-bold leading-snug transition-colors group-hover:text-utama">{produk.nama}</h3>
        <div className="mt-auto flex items-center justify-between gap-2">
          <p className="text-sm font-extrabold text-harga">{formatRupiah(produk.harga)}</p>
          <span className="text-xs font-semibold text-teks-lembut transition-colors group-hover:text-utama">
            Lihat detail →
          </span>
        </div>
      </div>
    </Link>
  );
}
