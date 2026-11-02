"use client";

import { createContext, useContext, useEffect, useState } from "react";

const FavoritContext = createContext(null);

export function FavoritProvider({ children }) {
  const [favorit, setFavorit] = useState([]);
  useEffect(() => {
    try { setFavorit(JSON.parse(localStorage.getItem("produk-favorit") || "[]")); } catch { setFavorit([]); }
  }, []);
  function toggle(id) {
    setFavorit((sebelumnya) => {
      const berikutnya = sebelumnya.includes(id) ? sebelumnya.filter((item) => item !== id) : [...sebelumnya, id];
      localStorage.setItem("produk-favorit", JSON.stringify(berikutnya));
      return berikutnya;
    });
  }
  return <FavoritContext.Provider value={{ favorit, toggle }}>{children}</FavoritContext.Provider>;
}

export function useFavorit() { return useContext(FavoritContext); }
