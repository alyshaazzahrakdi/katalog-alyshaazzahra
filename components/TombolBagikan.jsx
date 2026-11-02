"use client";

import { useState } from "react";

export default function TombolBagikan({ nama }) {
  const [pesan, setPesan] = useState("");
  async function bagikan() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: nama, url }); setPesan("Link dibagikan"); }
      else { await navigator.clipboard.writeText(url); setPesan("Link tersalin"); }
    } catch (error) {
      if (error?.name !== "AbortError") setPesan("Link belum bisa disalin");
    }
    window.setTimeout(() => setPesan(""), 2500);
  }
  return <div className="flex items-center gap-3"><button type="button" onClick={bagikan} className="rounded-xl border border-garis px-4 py-2.5 font-semibold hover:border-utama hover:text-utama">Bagikan produk</button>{pesan ? <span role="status" className="text-sm font-semibold text-utama">{pesan}</span> : null}</div>;
}
