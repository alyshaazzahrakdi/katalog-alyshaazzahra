"use client";

import KartuProduk from "@/components/KartuProduk";
import { useTerakhirDilihat } from "@/components/TerakhirDilihatProvider";

export default function TerakhirDilihat() {
  const konteks = useTerakhirDilihat();
  if (!konteks?.produk.length) return null;

  return (
    <section className="mt-10 border-t border-garis pt-8" aria-labelledby="terakhir-dilihat">
      <div className="mb-5">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-utama">Riwayatmu</p>
        <h2 id="terakhir-dilihat" className="mt-2 text-2xl font-extrabold">Terakhir dilihat</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {konteks.produk.map((produk) => <KartuProduk key={produk.id} produk={produk} />)}
      </div>
    </section>
  );
}
