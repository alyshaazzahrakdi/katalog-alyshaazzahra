"use client";

import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProdukAdmin, hapusProdukTerpilihAdmin } from "@/app/admin/actions";
import { useState } from "react";

export default function TabelProduk({ daftarProduk }) {
  const [terpilih, setTerpilih] = useState([]);
  const semuaTerpilih = daftarProduk.length > 0 && terpilih.length === daftarProduk.length;

  function ubahPilihan(id) {
    setTerpilih((pilihan) => (
      pilihan.includes(id) ? pilihan.filter((item) => item !== id) : [...pilihan, id]
    ));
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={hapusProdukTerpilihAdmin} className="flex justify-end">
        {terpilih.map((id) => <input key={id} type="hidden" name="produk_id" value={id} />)}
        <Tombol type="submit" varian="bahaya" disabled={terpilih.length === 0}>
          Hapus yang dipilih ({terpilih.length})
        </Tombol>
      </form>
      <div className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[620px] text-left text-sm">
        <thead className="bg-permukaan text-teks-lembut">
          <tr>
            <th className="w-12 px-4 py-3">
              <input
                type="checkbox"
                aria-label="Pilih semua produk di halaman ini"
                checked={semuaTerpilih}
                onChange={() => setTerpilih(semuaTerpilih ? [] : daftarProduk.map((produk) => produk.id))}
              />
            </th>
            <th className="px-4 py-3 font-semibold">Produk</th>
            <th className="px-4 py-3 font-semibold">Kategori</th>
            <th className="px-4 py-3 font-semibold">Harga</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="border-t border-garis">
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  aria-label={`Pilih ${produk.nama}`}
                  checked={terpilih.includes(produk.id)}
                  onChange={() => ubahPilihan(produk.id)}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <img src={produk.foto_url} alt="" className="h-10 w-10 rounded-md object-cover" />
                  <span className="font-semibold">{produk.nama}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
              <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {/* US-09 dan US-10 (bonus): ubah dan hapus produk */}
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <form action={hapusProdukAdmin.bind(null, produk.id)}>
                    <input type="hidden" name="foto_url" value={produk.foto_url ?? ""} />
                    <Tombol type="submit" varian="bahaya">
                      Hapus
                    </Tombol>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
