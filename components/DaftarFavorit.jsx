"use client";

import KartuProduk from "@/components/KartuProduk";
import { useFavorit } from "@/components/FavoritProvider";

export default function DaftarFavorit({ produk }) {
  const { favorit } = useFavorit();
  const pilihan = produk.filter((item) => favorit.includes(String(item.id)));
  if (!pilihan.length) return <p className="rounded-2xl border border-dashed border-garis bg-permukaan px-6 py-10 text-center text-teks-lembut">Belum ada produk favorit.</p>;
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">{pilihan.map((item) => <KartuProduk key={item.id} produk={item} />)}</div>;
}
