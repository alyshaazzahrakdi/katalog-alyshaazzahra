"use client";

import { useState } from "react";
import { daftarFotoProduk, urlFotoTampil } from "@/lib/foto";

export default function GaleriProduk({ produk }) {
  const foto = daftarFotoProduk(produk);
  const [aktif, setAktif] = useState(0);
  const [fotoGagal, setFotoGagal] = useState(false);
  return (
    <div className="relative min-h-64 bg-permukaan p-3 sm:min-h-72 sm:p-4 md:min-h-[390px]">
      {foto.length && !fotoGagal ? <img src={urlFotoTampil(foto[aktif])} alt={produk.nama} onError={() => { if (aktif + 1 < foto.length) setAktif((nilai) => nilai + 1); else setFotoGagal(true); }} className="h-full min-h-56 w-full object-contain sm:min-h-64 md:min-h-[330px]" /> : <p className="flex min-h-56 items-center justify-center text-sm text-teks-lembut">Foto belum tersedia</p>}
      {foto.length > 1 ? <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">{foto.map((item, index) => <button key={item} type="button" onClick={() => setAktif(index)} className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 bg-latar ${aktif === index ? "border-utama" : "border-garis"}`}><img src={urlFotoTampil(item)} alt="" className="h-full w-full object-contain" /></button>)}</div> : null}
    </div>
  );
}
