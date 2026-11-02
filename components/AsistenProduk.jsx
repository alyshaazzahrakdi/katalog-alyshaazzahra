"use client";

import { useState } from "react";

export default function AsistenProduk({ produkId }) {
  const [pertanyaan, setPertanyaan] = useState("");
  const [jawaban, setJawaban] = useState("");
  const [error, setError] = useState("");
  const [memuat, setMemuat] = useState(false);

  async function tanya(event) {
    event.preventDefault();
    setError("");
    setJawaban("");
    setMemuat(true);
    try {
      const response = await fetch("/api/produk-tanya", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ produk_id: produkId, pertanyaan }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Pertanyaan belum dapat dijawab.");
      } else {
        setJawaban(data.jawaban);
      }
    } catch {
      setError("Asisten AI belum dapat dihubungi. Coba lagi.");
    } finally {
      setMemuat(false);
    }
  }

  return (
    <section className="mt-8 rounded-2xl border border-garis bg-permukaan p-5" aria-labelledby="judul-asisten">
      <h2 id="judul-asisten" className="text-xl font-extrabold">Tanya tentang produk</h2>
      <p className="mt-1 text-sm text-teks-lembut">Tanyakan hal yang berkaitan dengan informasi produk ini.</p>
      <form onSubmit={tanya} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          required
          maxLength={500}
          value={pertanyaan}
          onChange={(event) => setPertanyaan(event.target.value)}
          placeholder="Contoh: Berapa harganya?"
          className="min-w-0 flex-1 rounded-lg border border-garis bg-latar px-3 py-2.5"
        />
        <button type="submit" disabled={memuat} className="rounded-lg bg-utama px-4 py-2.5 font-semibold text-white disabled:opacity-50">
          {memuat ? "Menjawab..." : "Tanya AI"}
        </button>
      </form>
      {error ? <p role="alert" className="mt-3 text-sm font-semibold text-bahaya">{error}</p> : null}
      {jawaban ? <p role="status" className="mt-4 rounded-xl border border-garis bg-latar p-4 text-sm leading-6">{jawaban}</p> : null}
      <p className="mt-3 text-xs text-teks-lembut">Maksimal 5 pertanyaan per 15 menit dari alamat jaringan yang sama.</p>
    </section>
  );
}
