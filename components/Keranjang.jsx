"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { formatRupiah } from "@/lib/format";

const KeranjangContext = createContext(null);

export function KeranjangProvider({ children, toko }) {
  const [items, setItems] = useState([]);
  const [buka, setBuka] = useState(false);
  const sudahDimuat = useRef(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("keranjang-produk") || "[]"));
    } catch {
      setItems([]);
    }
    sudahDimuat.current = true;
  }, []);

  useEffect(() => {
    if (!sudahDimuat.current) return;
    localStorage.setItem("keranjang-produk", JSON.stringify(items));
  }, [items]);

  function tambah(produk) {
    setItems((sebelumnya) => {
      const ada = sebelumnya.find((item) => item.id === produk.id);
      if (ada) return sebelumnya.map((item) => item.id === produk.id ? { ...item, jumlah: item.jumlah + 1 } : item);
      return [...sebelumnya, { id: produk.id, nama: produk.nama, harga: produk.harga_diskon || produk.harga, jumlah: 1 }];
    });
    setBuka(true);
  }

  function ubahJumlah(id, jumlah) {
    if (!Number.isFinite(jumlah) || jumlah < 1) {
      hapusItem(id);
      return;
    }
    setItems((sebelumnya) => sebelumnya.map((item) => item.id === id ? { ...item, jumlah } : item));
  }

  function hapusItem(id) {
    setItems((sebelumnya) => sebelumnya.filter((item) => item.id !== id));
  }

  const totalItem = items.reduce((total, item) => total + item.jumlah, 0);
  const totalHarga = items.reduce((total, item) => total + item.harga * item.jumlah, 0);
  const pesan = `Halo, saya ingin memesan:\n${items.map((item) => `- ${item.nama} x${item.jumlah} (${formatRupiah(item.harga * item.jumlah)})`).join("\n")}`;

  return (
    <KeranjangContext.Provider value={{ tambah }}>
      {children}
      <div className="fixed bottom-4 right-4 z-40">
        {buka ? (
          <div className="mb-3 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-garis bg-latar p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-extrabold">Keranjang</h2>
              <button onClick={() => setBuka(false)} className="text-teks-lembut">Tutup</button>
            </div>
            <div className="my-3 flex max-h-52 flex-col gap-3 overflow-y-auto">
              {items.length ? items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{item.nama}</p>
                    <p className="text-xs text-teks-lembut">{formatRupiah(item.harga * item.jumlah)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" aria-label={`Kurangi jumlah ${item.nama}`} onClick={() => ubahJumlah(item.id, item.jumlah - 1)} className="h-7 w-7 rounded border border-garis font-bold">−</button>
                    <span className="w-6 text-center">{item.jumlah}</span>
                    <button type="button" aria-label={`Tambah jumlah ${item.nama}`} onClick={() => ubahJumlah(item.id, item.jumlah + 1)} className="h-7 w-7 rounded border border-garis font-bold">+</button>
                    <button type="button" aria-label={`Hapus ${item.nama} dari keranjang`} onClick={() => hapusItem(item.id)} className="ml-1 px-1 text-bahaya hover:underline">Hapus</button>
                  </div>
                </div>
              )) : <p className="text-sm text-teks-lembut">Keranjang masih kosong.</p>}
            </div>
            {items.length ? (
              <>
                <p className="mb-3 border-t border-garis pt-3 text-right text-sm font-extrabold">
                  Total: {formatRupiah(totalHarga)}
                </p>
                <a href={`https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`} target="_blank" rel="noreferrer" className="block rounded-lg bg-utama px-4 py-3 text-center text-sm font-bold text-white">Pesan semua via WhatsApp</a>
              </>
            ) : null}
          </div>
        ) : null}
        <button onClick={() => setBuka(!buka)} className="ml-auto block rounded-full bg-utama px-5 py-3 font-bold text-white shadow-lg">
          Keranjang ({totalItem})
        </button>
      </div>
    </KeranjangContext.Provider>
  );
}

export function TombolTambahKeranjang({ produk }) {
  const { tambah } = useContext(KeranjangContext);
  return <button type="button" onClick={() => tambah(produk)} className="rounded-lg border border-utama px-3 py-2 text-sm font-bold text-utama hover:bg-permukaan">+ Keranjang</button>;
}
