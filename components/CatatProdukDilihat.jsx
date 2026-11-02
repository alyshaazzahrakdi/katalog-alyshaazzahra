"use client";

import { useEffect } from "react";
import { useTerakhirDilihat } from "@/components/TerakhirDilihatProvider";

export default function CatatProdukDilihat({ produk }) {
  const konteks = useTerakhirDilihat();
  useEffect(() => {
    konteks?.catat(produk);
  // Produk detail tidak berubah selama halaman ini terbuka.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [produk]);
  return null;
}
