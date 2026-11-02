"use client";

import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "produk-bandingkan";
const Konteks = createContext(null);

export function BandingkanProvider({ children }) {
  const [produk, setProduk] = useState([]);

  useEffect(() => {
    try {
      setProduk(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
    } catch {
      setProduk([]);
    }
  }, []);

  function toggle(item) {
    setProduk((sebelumnya) => {
      const ada = sebelumnya.some((produkLama) => String(produkLama.id) === String(item.id));
      const berikutnya = ada
        ? sebelumnya.filter((produkLama) => String(produkLama.id) !== String(item.id))
        : sebelumnya.length >= 2
          ? [...sebelumnya.slice(1), item]
          : [...sebelumnya, item];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(berikutnya));
      return berikutnya;
    });
  }

  function hapusSemua() {
    localStorage.removeItem(STORAGE_KEY);
    setProduk([]);
  }

  return <Konteks.Provider value={{ produk, toggle, hapusSemua }}>{children}</Konteks.Provider>;
}

export function useBandingkan() {
  return useContext(Konteks);
}
