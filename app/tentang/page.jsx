import { ambilPengaturanToko } from "@/lib/toko-server";

export default async function TentangPage() {
  const toko = await ambilPengaturanToko();
  return <section className="py-10 sm:py-16"><p className="text-sm font-bold uppercase tracking-[0.16em] text-utama">Kenali kami</p><h1 className="mt-3 text-4xl font-extrabold">Tentang {toko.nama}</h1><p className="mt-6 max-w-prose leading-7 text-teks-lembut">{toko.tagline} Kami memilih produk berkualitas untuk menemani hari-hari kamu.</p><div className="mt-10 grid gap-5 sm:grid-cols-3"><div className="rounded-2xl border border-garis bg-permukaan p-5"><h2 className="font-bold">Alamat</h2><p className="mt-2 text-teks-lembut">{toko.alamat}</p></div><div className="rounded-2xl border border-garis bg-permukaan p-5"><h2 className="font-bold">Jam buka</h2><p className="mt-2 text-teks-lembut">{toko.jamBuka}</p></div><div className="rounded-2xl border border-garis bg-permukaan p-5"><h2 className="font-bold">Kontak</h2><p className="mt-2 text-teks-lembut">WhatsApp: {toko.nomorWhatsApp}</p></div></div></section>;
}
