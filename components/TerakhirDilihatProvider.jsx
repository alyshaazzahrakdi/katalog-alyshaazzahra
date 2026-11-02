"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "produk-terakhir-dilihat";
const BATAS = 6;
const Konteks = createContext(null);

export function TerakhirDilihatProvider({ children }) {
  const [produk, setProduk] = useState([]);

  useEffect(() => {
    try {
      setProduk(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      setProduk([]);
    }
  }, []);

  function catat(item) {
    if (!item?.id) return;
    setProduk((sebelumnya) => {
      const berikutnya = [item, ...sebelumnya.filter((lama) => String(lama.id) !== String(item.id))].slice(0, BATAS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(berikutnya));
      return berikutnya;
    });
  }

  return <Konteks.Provider value={{ produk, catat }}>{children}</Konteks.Provider>;
}

export function useTerakhirDilihat() {
  return useContext(Konteks);
}
