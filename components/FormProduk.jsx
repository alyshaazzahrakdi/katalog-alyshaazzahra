 "use client";

import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";
import { useActionState, useEffect } from "react";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, nilaiForm = {}, errors = {}, labelTombol, action }) {
  const [state, generateDescription, pending] = useActionState(buatDeskripsiAI, {});
  const nilai = (nama) => Object.prototype.hasOwnProperty.call(nilaiForm, nama) ? nilaiForm[nama] : produk[nama];
  useEffect(() => {
    if (state.description) document.getElementById("deskripsi-produk").value = state.description;
  }, [state.description]);

  return (
    <form action={action} encType="multipart/form-data" className="flex max-w-xl flex-col gap-4">
      <Input label="Nama produk" name="nama" defaultValue={nilai("nama")} error={errors.nama} required />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={nilai("harga")}
        error={errors.harga}
        required
      />
      <Input label="Kategori" name="kategori" defaultValue={nilai("kategori")} error={errors.kategori} />
      <Input
        label="Link foto (opsional)"
        name="foto_url"
        placeholder="https://drive.google.com/file/d/.../view"
        defaultValue={nilai("foto_url")}
      />
      <Input label="Link foto tambahan (satu per baris, opsional)" name="foto_urls" textarea placeholder="https://..." defaultValue={nilaiForm.foto_urls ?? (Array.isArray(produk.foto_urls) ? produk.foto_urls.join("\n") : "")} />
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
      <Input label="Varian ukuran dan harga (satu per baris: Nama|Harga)" name="varian" textarea placeholder={"250 g|25000\n500 g|45000"} defaultValue={nilaiForm.varian ?? (Array.isArray(produk.varian_produk) ? produk.varian_produk.map((item) => `${item.nama}|${item.harga}`).join("\n") : "")} error={errors.varian} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Input label="Status stok" name="status" defaultValue={nilai("status") || "tersedia"} />
        <Input label="Jumlah stok siap" name="stok" type="number" min="0" defaultValue={nilai("stok") ?? 0} required />
        <Input label="Harga diskon (opsional)" name="harga_diskon" type="number" min="0" defaultValue={nilai("harga_diskon") ?? ""} />
        <Input label="Badge (opsional)" name="badge" placeholder="Baru / Terlaris" defaultValue={nilai("badge")} />
      </div>
      <div className="flex flex-col gap-2">
        <Input label="Deskripsi" name="deskripsi" textarea defaultValue={nilai("deskripsi")} id="deskripsi-produk" />
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
