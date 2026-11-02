"use client";

import Link from "next/link";
import { formatRupiah } from "@/lib/format";
import { urlFotoTampil } from "@/lib/foto";
import { useBandingkan } from "@/components/BandingkanProvider";
import TombolBandingkan from "@/components/TombolBandingkan";

export default function HalamanBandingkan() {
  const konteks = useBandingkan();
  const produk = konteks?.produk || [];

  return (
    <section className="py-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-utama">Bantu memilih</p>
          <h1 className="mt-2 text-3xl font-extrabold">Bandingkan produk</h1>
        </div>
        {produk.length ? <button type="button" onClick={konteks.hapusSemua} className="text-sm font-semibold text-bahaya">Kosongkan pilihan</button> : null}
      </div>
      {!produk.length ? (
        <div className="mt-8 rounded-2xl border border-dashed border-garis bg-permukaan px-6 py-12 text-center">
          <p className="font-semibold">Belum ada produk untuk dibandingkan.</p>
          <Link href="/" className="mt-4 inline-block font-semibold text-utama hover:underline">Pilih produk dari katalog →</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {produk.map((item) => (
            <article key={item.id} className="overflow-hidden rounded-2xl border border-garis bg-latar">
              <img src={urlFotoTampil(item.foto_url)} alt={item.nama} className="h-52 w-full bg-permukaan object-contain p-4" />
              <div className="space-y-4 p-5">
                <h2 className="text-xl font-extrabold">{item.nama || "Produk tidak tersedia"}</h2>
                <dl className="divide-y divide-garis text-sm">
                  <div className="flex justify-between gap-4 py-3"><dt className="text-teks-lembut">Kategori</dt><dd className="font-semibold">{item.kategori || "-"}</dd></div>
                  <div className="flex justify-between gap-4 py-3"><dt className="text-teks-lembut">Harga</dt><dd className="font-extrabold text-harga">{formatRupiah(item.harga_diskon || item.harga)}</dd></div>
                  <div className="py-3"><dt className="text-teks-lembut">Deskripsi</dt><dd className="mt-2 leading-6">{item.deskripsi || "Deskripsi belum tersedia."}</dd></div>
                </dl>
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/produk/${item.id}`} className="text-sm font-semibold text-utama hover:underline">Lihat detail</Link>
                  <TombolBandingkan produk={item} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
