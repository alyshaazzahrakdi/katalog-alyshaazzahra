import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { simpanBanner, simpanPengaturanToko } from "@/app/admin/actions";

export default async function HalamanAdmin({ searchParams }) {
  const params = await searchParams;
  const pilihanUkuran = [10, 15, 50, 100];
  const ukuran = pilihanUkuran.includes(Number(params?.ukuran)) ? Number(params.ukuran) : 10;
  const nomorHalamanDiminta = Math.max(1, Number.parseInt(params?.halaman, 10) || 1);
  const cari = typeof params?.cari === "string" ? params.cari.trim() : "";
  const supabase = await createServerAuthClient();
  const countQuery = supabase.from("produk").select("id", { count: "exact", head: true });
  if (cari) countQuery.ilike("nama", `%${cari}%`);
  const { count, error: countError } = await countQuery;

  if (countError) {
    throw countError;
  }

  const jumlahHalaman = Math.max(1, Math.ceil((count ?? 0) / ukuran));
  const nomorHalaman = Math.min(nomorHalamanDiminta, jumlahHalaman);
  const awal = (nomorHalaman - 1) * ukuran;
  const akhir = awal + ukuran - 1;
  const dataQuery = supabase.from("produk").select("*").order("urutan", { ascending: true }).order("created_at", { ascending: false }).range(awal, akhir);
  if (cari) dataQuery.ilike("nama", `%${cari}%`);
  const { data: daftarProduk, error } = await dataQuery;

  if (error) {
    throw error;
  }
  const { data: semuaKategori, error: kategoriError } = await supabase
    .from("produk")
    .select("kategori");

  if (kategoriError) {
    throw kategoriError;
  }

  const jumlahPerKategori = Object.entries(
    (semuaKategori ?? []).reduce((hasil, produk) => {
      const kategori = produk.kategori?.trim() || "Tanpa kategori";
      hasil[kategori] = (hasil[kategori] || 0) + 1;
      return hasil;
    }, {}),
  ).sort(([, jumlahA], [, jumlahB]) => jumlahB - jumlahA);
  const { data: terlaris } = await supabase.from("klik_whatsapp").select("produk_id").limit(1000);
  const idsTerlaris = [...new Set((terlaris ?? []).map((item) => item.produk_id).filter(Boolean))];
  const { data: namaProduk } = idsTerlaris.length ? await supabase.from("produk").select("id,nama").in("id", idsTerlaris) : { data: [] };
  const namaById = Object.fromEntries((namaProduk ?? []).map((item) => [item.id, item.nama]));
  const hitungan = Object.values((terlaris ?? []).reduce((acc, item) => { const key = item.produk_id; acc[key] = acc[key] || { nama: namaById[key] || "Produk", jumlah: 0 }; acc[key].jumlah += 1; return acc; }, {})).sort((a, b) => b.jumlah - a.jumlah).slice(0, 5);
  const { data: banner } = await supabase.from("banner_promo").select("*").order("updated_at", { ascending: false }).limit(1).maybeSingle();
  const { data: pengaturanToko, error: pengaturanError } = await supabase.from("pengaturan_toko").select("*").eq("id", 1).maybeSingle();
  if (pengaturanError) throw pengaturanError;
  const fieldNames = ["nama", "tagline", "nomor_whatsapp", "alamat", "jam_buka"];
  const nilaiPengaturan = Object.fromEntries(fieldNames.map((field) => [field, typeof params?.[field] === "string" ? params[field] : pengaturanToko?.[field] || ""]));
  const errorsPengaturan = Object.fromEntries(fieldNames.filter((field) => typeof params?.[`error_${field}`] === "string").map((field) => [field, params[`error_${field}`]]));

  return (
    <div className="flex flex-col gap-6 py-8 sm:gap-8 sm:py-10">
      <NavAdmin />
      <section className="rounded-2xl border border-garis bg-latar p-5"><h2 className="text-xl font-extrabold">Produk terlaris</h2>{hitungan.length ? <ol className="mt-3 list-decimal pl-5">{hitungan.map((item) => <li key={item.nama}>{item.nama} — {item.jumlah} klik</li>)}</ol> : <p className="mt-2 text-teks-lembut">Belum ada data klik WhatsApp.</p>}</section>
      <section className="rounded-2xl border border-garis bg-latar p-5"><h2 className="text-xl font-extrabold">Banner promo</h2><form action={simpanBanner} className="mt-3 grid gap-3 sm:grid-cols-2"><input type="hidden" name="id" value={banner?.id || ""} /><input required name="judul" defaultValue={banner?.judul || ""} placeholder="Judul" className="rounded-lg border border-garis px-3 py-2" /><input name="teks" defaultValue={banner?.teks || ""} placeholder="Teks promo" className="rounded-lg border border-garis px-3 py-2" /><input name="gambar_url" defaultValue={banner?.gambar_url || ""} placeholder="URL gambar (opsional)" className="rounded-lg border border-garis px-3 py-2" /><input name="tautan" defaultValue={banner?.tautan || ""} placeholder="Tautan (opsional)" className="rounded-lg border border-garis px-3 py-2" /><select name="aktif" defaultValue={String(banner?.aktif ?? true)} className="rounded-lg border border-garis px-3 py-2"><option value="true">Aktif</option><option value="false">Nonaktif</option></select><button className="rounded-lg bg-utama px-4 py-2 font-semibold text-white">Simpan banner</button></form></section>
      <section className="rounded-2xl border border-garis bg-latar p-5"><h2 className="text-xl font-extrabold">Pengaturan toko</h2><p className="mt-1 text-sm text-teks-lembut">Informasi ini dipakai di header, footer, halaman tentang, dan tombol WhatsApp.</p><form action={simpanPengaturanToko} className="mt-4 grid gap-3 sm:grid-cols-2"><label className="flex flex-col gap-1.5 text-sm font-semibold">Nama toko<input name="nama" defaultValue={nilaiPengaturan.nama} className="rounded-lg border border-garis px-3 py-2.5" />{errorsPengaturan.nama ? <span className="font-normal text-bahaya">{errorsPengaturan.nama}</span> : null}</label><label className="flex flex-col gap-1.5 text-sm font-semibold">Tagline<input name="tagline" defaultValue={nilaiPengaturan.tagline} className="rounded-lg border border-garis px-3 py-2.5" />{errorsPengaturan.tagline ? <span className="font-normal text-bahaya">{errorsPengaturan.tagline}</span> : null}</label><label className="flex flex-col gap-1.5 text-sm font-semibold">Nomor WhatsApp<input name="nomor_whatsapp" inputMode="tel" placeholder="6281234567890" defaultValue={nilaiPengaturan.nomor_whatsapp} className="rounded-lg border border-garis px-3 py-2.5" />{errorsPengaturan.nomor_whatsapp ? <span className="font-normal text-bahaya">{errorsPengaturan.nomor_whatsapp}</span> : null}</label><label className="flex flex-col gap-1.5 text-sm font-semibold">Alamat<input name="alamat" defaultValue={nilaiPengaturan.alamat} className="rounded-lg border border-garis px-3 py-2.5" />{errorsPengaturan.alamat ? <span className="font-normal text-bahaya">{errorsPengaturan.alamat}</span> : null}</label><label className="flex flex-col gap-1.5 text-sm font-semibold sm:col-span-2">Jam buka<input name="jam_buka" defaultValue={nilaiPengaturan.jam_buka} className="rounded-lg border border-garis px-3 py-2.5" />{errorsPengaturan.jam_buka ? <span className="font-normal text-bahaya">{errorsPengaturan.jam_buka}</span> : null}</label><button className="rounded-lg bg-utama px-4 py-2 font-semibold text-white sm:col-span-2 sm:justify-self-start">Simpan pengaturan toko</button></form></section>
      <section className="relative overflow-hidden rounded-[2rem] bg-utama px-6 py-8 text-white shadow-[0_18px_45px_rgba(31,107,79,0.18)] sm:px-10 sm:py-10">
        <div className="absolute -right-16 -top-20 h-52 w-52 rounded-full border-[24px] border-white/10" />
        <div className="absolute -bottom-24 right-24 h-40 w-40 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/70">Ruang kerja admin</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Kelola katalog toko</h1>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/80">
              Atur produk, foto, harga, dan informasi katalog dari satu tempat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Tombol href="/admin/produk/baru" className="border border-white/20 bg-utama-gelap text-white hover:bg-utama">
              + Tambah produk
            </Tombol>
            <Tombol href="/admin/kategori" varian="garis">Kelola kategori</Tombol>
            <Tombol href="/admin/export" varian="garis">Ekspor CSV</Tombol>
          </div>
        </div>
      </section>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-garis bg-latar p-5 shadow-sm">
          <p className="text-sm text-teks-lembut">Total produk</p>
          <p className="mt-2 text-3xl font-extrabold text-utama">{count ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-garis bg-permukaan p-5">
          <p className="text-sm text-teks-lembut">Tampilan halaman</p>
          <p className="mt-2 text-3xl font-extrabold">{ukuran} <span className="text-base font-semibold text-teks-lembut">data</span></p>
        </div>
        <div className="rounded-2xl border border-garis bg-harga-latar p-5">
          <p className="text-sm text-harga">Status katalog</p>
          <p className="mt-2 text-lg font-extrabold text-harga">{count ? "Aktif dan siap dilihat" : "Belum ada produk"}</p>
        </div>
      </div>
      <section className="rounded-2xl border border-garis bg-latar p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold">Produk per kategori</h2>
            <p className="mt-1 text-sm text-teks-lembut">Ringkasan seluruh produk di katalog.</p>
          </div>
          <span className="rounded-full bg-permukaan px-3 py-1 text-xs font-bold text-teks-lembut">
            {jumlahPerKategori.length} kategori
          </span>
        </div>
        {jumlahPerKategori.length ? (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {jumlahPerKategori.map(([kategori, jumlah]) => (
              <div key={kategori} className="flex items-center justify-between rounded-xl border border-garis bg-permukaan/60 px-4 py-3">
                <span className="font-semibold">{kategori}</span>
                <span className="rounded-full bg-utama px-3 py-1 text-sm font-bold text-white">{jumlah}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 text-sm text-teks-lembut">Belum ada kategori produk.</p>
        )}
      </section>
      {typeof params?.error === "string" ? (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-bahaya">
          {params.error}
        </p>
      ) : null}
      {typeof params?.success === "string" ? (
        <p
          role="status"
          aria-live="polite"
          className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-utama"
        >
          ✓ {params.success}
        </p>
      ) : null}
      <section className="overflow-hidden rounded-[1.5rem] border border-garis bg-latar shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-garis bg-permukaan/60 px-5 py-4">
          <div>
            <h2 className="font-extrabold">Daftar produk</h2>
            <p className="mt-1 text-sm text-teks-lembut">Pilih produk untuk menghapus beberapa data sekaligus.</p>
          </div>
          <form className="flex items-center gap-2 text-sm" method="get">
            <input name="cari" defaultValue={cari} placeholder="Cari produk..." className="w-36 rounded-lg border border-garis bg-latar px-3 py-2" />
            <label htmlFor="ukuran" className="text-teks-lembut">Tampilkan</label>
          <select
            id="ukuran"
            name="ukuran"
            defaultValue={String(ukuran)}
            className="rounded-lg border border-garis bg-latar px-3 py-2"
          >
            {pilihanUkuran.map((nilai) => (
              <option key={nilai} value={nilai}>{nilai}</option>
            ))}
          </select>
          <input type="hidden" name="halaman" value="1" />
          <Tombol type="submit" varian="garis">Terapkan</Tombol>
          </form>
        </div>
        <TabelProduk daftarProduk={daftarProduk ?? []} />
      </section>
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
        <span className="text-teks-lembut">Menampilkan {daftarProduk?.length ?? 0} dari {count ?? 0} produk</span>
        <div className="flex items-center gap-3">
          <span className="text-teks-lembut">
            Halaman {nomorHalaman} dari {jumlahHalaman}
          </span>
          {nomorHalaman > 1 ? (
            <a href={`/admin?cari=${encodeURIComponent(cari)}&ukuran=${ukuran}&halaman=${nomorHalaman - 1}`} className="font-semibold hover:text-utama">
              Sebelumnya
            </a>
          ) : null}
          {nomorHalaman < jumlahHalaman ? (
            <a href={`/admin?cari=${encodeURIComponent(cari)}&ukuran=${ukuran}&halaman=${nomorHalaman + 1}`} className="font-semibold hover:text-utama">
              Berikutnya
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
