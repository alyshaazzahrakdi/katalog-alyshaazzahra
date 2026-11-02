"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    const tersimpan = localStorage.getItem("tema");
    const aktif = tersimpan === "gelap" || (tersimpan === null && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setGelap(aktif);
    document.documentElement.classList.toggle("dark", aktif);
  }, []);

  function ubahTema() {
    setGelap((sebelumnya) => {
      const berikutnya = !sebelumnya;
      localStorage.setItem("tema", berikutnya ? "gelap" : "terang");
      document.documentElement.classList.toggle("dark", berikutnya);
      return berikutnya;
    });
  }

  return <ThemeContext.Provider value={{ gelap, ubahTema }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
