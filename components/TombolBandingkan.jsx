"use client";

import { useBandingkan } from "@/components/BandingkanProvider";

export default function TombolBandingkan({ produk }) {
  const konteks = useBandingkan();
  const dipilih = konteks?.produk.some((item) => String(item.id) === String(produk.id));
  const penuh = !dipilih && konteks?.produk.length >= 2;

  return (
    <button
      type="button"
      onClick={() => konteks?.toggle(produk)}
      title={penuh ? "Produk pertama akan diganti" : undefined}
      className={`w-full rounded-lg border px-3 py-2 text-xs font-semibold transition min-[400px]:w-auto ${dipilih ? "border-utama bg-utama text-white" : "border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"}`}
    >
      {dipilih ? "✓ Dibandingkan" : "Bandingkan"}
    </button>
  );
}
