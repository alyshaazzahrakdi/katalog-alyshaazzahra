"use client";

import { useState } from "react";
import { urlFotoTampil } from "@/lib/foto";

export default function GaleriProduk({ produk }) {
  const foto = [...new Set([...(Array.isArray(produk.foto_urls) ? produk.foto_urls : []), produk.foto_url].filter(Boolean))];
  const [aktif, setAktif] = useState(0);
  return (
    <div className="relative min-h-72 bg-permukaan p-4 md:min-h-[520px]">
      <img src={urlFotoTampil(foto[aktif])} alt={produk.nama} className="h-full min-h-64 w-full object-contain md:min-h-[430px]" />
      {foto.length > 1 ? <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">{foto.map((item, index) => <button key={item} type="button" onClick={() => setAktif(index)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-latar ${aktif === index ? "border-utama" : "border-garis"}`}><img src={urlFotoTampil(item)} alt="" className="h-full w-full object-contain" /></button>)}</div> : null}
    </div>
  );
}
