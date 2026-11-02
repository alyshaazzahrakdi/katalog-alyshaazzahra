 "use client";

import { formatRupiah } from "@/lib/format";
import { toko } from "@/lib/toko";
import { useState } from "react";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const pesan = `Halo, saya ingin memesan ${produk.nama} sebanyak ${jumlah} dengan harga ${formatRupiah(produk.harga)} per item.`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="flex flex-col gap-1 text-sm font-semibold text-teks-lembut">
        Jumlah
        <select value={jumlah} onChange={(event) => setJumlah(Number(event.target.value))} className="rounded-lg border border-garis bg-latar px-3 py-3 text-teks">
          {Array.from({ length: 10 }, (_, index) => index + 1).map((nilai) => <option key={nilai} value={nilai}>{nilai}</option>)}
        </select>
      </label>
      <a
      href={`https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`}
      target="_blank"
      rel="noreferrer"
      className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
