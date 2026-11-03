"use client";

import { useFavorit } from "@/components/FavoritProvider";

export default function TombolFavorit({ id }) {
  const konteks = useFavorit();
  const aktif = konteks?.favorit.includes(String(id));
  return (
    <button type="button" onClick={() => konteks?.toggle(String(id))} aria-label={aktif ? "Hapus dari favorit" : "Tambahkan ke favorit"} className={`w-full rounded-full border px-3 py-2 text-sm font-semibold transition min-[400px]:w-auto ${aktif ? "border-utama bg-utama text-white" : "border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"}`}>
      {aktif ? "♥ Favorit" : "♡ Favorit"}
    </button>
  );
}
