import Input from "@/components/Input";
import Tombol from "@/components/Tombol";

// Dipakai untuk tambah produk (US-08) dan ubah produk (US-09). Keduanya bonus di jalur offline.
// Nama field sama dengan kolom tabel "produk".
export default function FormProduk({ produk = {}, labelTombol, action }) {
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
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />
      <Input
        label={produk.foto_url ? "Ganti foto produk (opsional)" : "Foto produk (opsional)"}
        name="foto"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
      />
      {produk.foto_url ? <input type="hidden" name="foto_url_lama" value={produk.foto_url} /> : null}
      <p className="-mt-2 text-xs font-normal text-teks-lembut">Format JPG, PNG, WEBP, atau GIF. Maksimal 5 MB.</p>
      <Input label="Deskripsi" name="deskripsi" textarea defaultValue={produk.deskripsi} />
      <div className="flex gap-3">
        <Tombol type="submit">{labelTombol}</Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
