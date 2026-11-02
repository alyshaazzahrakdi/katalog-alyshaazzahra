"use client";

import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const tema = useTheme();
  return (
    <button type="button" onClick={tema?.ubahTema} aria-label="Ganti mode warna" className="rounded-full border border-garis px-3 py-2 text-sm font-semibold hover:border-utama hover:text-utama">
      {tema?.gelap ? "☀️ Terang" : "🌙 Gelap"}
    </button>
  );
}
