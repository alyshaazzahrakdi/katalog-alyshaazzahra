"use client";

import { formatRupiah } from "@/lib/format";
import Tombol from "@/components/Tombol";
import { hapusProdukAdmin, hapusProdukTerpilihAdmin, ubahStatusProdukAdmin, ubahUrutanProdukAdmin } from "@/app/admin/actions";
import { useState } from "react";
import { urlFotoTampil } from "@/lib/foto";

export default function TabelProduk({ daftarProduk }) {
  const [terpilih, setTerpilih] = useState([]);
  const semuaTerpilih = daftarProduk.length > 0 && terpilih.length === daftarProduk.length;

  function ubahPilihan(id) {
    setTerpilih((pilihan) => (
      pilihan.includes(id) ? pilihan.filter((item) => item !== id) : [...pilihan, id]
    ));
  }

  function konfirmasiHapus(event, jumlah = 1) {
    const pesan = jumlah > 1
      ? `Hapus ${jumlah} produk yang dipilih? Data yang dihapus tidak dapat dikembalikan.`
      : "Hapus produk ini? Data yang dihapus tidak dapat dikembalikan.";

    if (!window.confirm(pesan)) {
      event.preventDefault();
    }
  }

  function fotoProduk(produk) {
    return produk?.foto_url || (Array.isArray(produk?.foto_urls) ? produk.foto_urls.find(Boolean) : "");
  }

  return (
    <div className="flex flex-col gap-3">
      <form action={hapusProdukTerpilihAdmin} onSubmit={(event) => konfirmasiHapus(event, terpilih.length)} className="flex justify-end px-5 pt-4">
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
            <th className="px-4 py-3 font-semibold">Stok</th>
            <th className="px-4 py-3 font-semibold">
              <span className="sr-only">Aksi</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {daftarProduk.map((produk) => (
            <tr key={produk.id} className="border-t border-garis transition-colors hover:bg-permukaan/50">
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
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border border-garis bg-permukaan">
                    <img src={urlFotoTampil(fotoProduk(produk))} alt="" className="h-full w-full object-contain" />
                  </div>
                  <span className="font-bold">{produk.nama}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-teks-lembut">{produk.kategori}</td>
              <td className="px-4 py-3">{formatRupiah(produk.harga)}</td>
              <td className={`px-4 py-3 font-semibold ${produk.stok > 0 ? "text-utama" : "text-bahaya"}`}>
                {produk.stok > 0 ? `${produk.stok} siap` : "Habis"}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {/* US-09 dan US-10 (bonus): ubah dan hapus produk */}
                  <Tombol href={`/admin/produk/${produk.id}/ubah`} varian="garis">
                    Ubah
                  </Tombol>
                  <form action={ubahStatusProdukAdmin.bind(null, produk.id)}>
                    <input type="hidden" name="aktif" value={String(!produk.aktif)} />
                    <Tombol type="submit" varian="garis">{produk.aktif === false ? "Aktifkan" : "Nonaktifkan"}</Tombol>
                  </form>
                  <form action={ubahUrutanProdukAdmin.bind(null, produk.id)}>
                    <input type="hidden" name="arah" value="naik" />
                    <Tombol type="submit" varian="garis" aria-label={`Naikkan urutan ${produk.nama}`}>↑</Tombol>
                  </form>
                  <form action={ubahUrutanProdukAdmin.bind(null, produk.id)}>
                    <input type="hidden" name="arah" value="turun" />
                    <Tombol type="submit" varian="garis" aria-label={`Turunkan urutan ${produk.nama}`}>↓</Tombol>
                  </form>
                  <form action={hapusProdukAdmin.bind(null, produk.id)} onSubmit={konfirmasiHapus}>
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
