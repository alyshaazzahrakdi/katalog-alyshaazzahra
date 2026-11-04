"use client";

import { useState } from "react";
import { daftarFotoProduk, urlFotoTampil } from "@/lib/foto";

export default function GambarProduk({ produk, alt, className = "" }) {
  const foto = daftarFotoProduk(produk);
  const [indeks, setIndeks] = useState(0);
  const sumber = foto[indeks];

  if (!sumber) {
    return <span className="flex h-full items-center justify-center px-4 text-center text-xs text-teks-lembut">Foto belum tersedia</span>;
  }

  return (
    <img
      src={urlFotoTampil(sumber)}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setIndeks((nilai) => (nilai + 1 < foto.length ? nilai + 1 : nilai))}
    />
  );
}
