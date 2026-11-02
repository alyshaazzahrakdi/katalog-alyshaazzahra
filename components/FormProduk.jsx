 "use client";

import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";
import { useActionState, useEffect } from "react";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action }) {
  const [state, generateDescription, pending] = useActionState(buatDeskripsiAI, {});
  useEffect(() => {
    if (state.description) document.getElementById("deskripsi-produk").value = state.description;
  }, [state.description]);

  return (
    <form action={action} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4">
      <Input label="Nama produk" name="nama" defaultValue={produk.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={produk.kategori} />
      <Input
        label="Link foto (opsional)"
        name="foto_url"
        placeholder="https://drive.google.com/file/d/.../view"
        defaultValue={produk.foto_url}
      />
      <Input label="Link foto tambahan (satu per baris, opsional)" name="foto_urls" textarea placeholder="https://..." defaultValue={Array.isArray(produk.foto_urls) ? produk.foto_urls.join("\n") : ""} />
      <p className="-mt-2 text-xs font-normal text-teks-lembut">
        Alternatif hemat storage: tempel link Google Drive dengan akses “Siapa saja yang memiliki link”. Sistem akan mengubahnya menjadi link gambar langsung.
      </p>
      <Input
        label={produk.foto_url ? "Ganti foto produk (opsional)" : "Foto produk (opsional)"}
        name="foto"
        type="file"
        accept="image/*"
        multiple
      />
      {produk.foto_url ? <input type="hidden" name="foto_url_lama" value={produk.foto_url} /> : null}
      <p className="-mt-2 text-xs font-normal text-teks-lembut">
        Format gambar yang didukung: JPG, PNG, GIF, WEBP, BMP, TIFF, atau AVIF. Maksimal 5 MB. File Word, PHP, dan file palsu akan ditolak.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="Status stok" name="status" defaultValue={produk.status || "tersedia"} />
        <Input label="Harga diskon (opsional)" name="harga_diskon" type="number" min="0" defaultValue={produk.harga_diskon ?? ""} />
        <Input label="Badge (opsional)" name="badge" placeholder="Baru / Terlaris" defaultValue={produk.badge} />
      </div>
      <div className="flex flex-col gap-2">
        <Input label="Deskripsi" name="deskripsi" textarea defaultValue={produk.deskripsi} id="deskripsi-produk" />
        <button formAction={generateDescription} disabled={pending} className="self-start text-sm font-bold text-utama hover:text-utama-gelap disabled:opacity-50">
          {pending ? "Membuat deskripsi..." : "Buat deskripsi dengan AI"}
        </button>
        {state.error ? <p role="alert" className="text-sm font-normal text-bahaya">{state.error}</p> : null}
      </div>
      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
