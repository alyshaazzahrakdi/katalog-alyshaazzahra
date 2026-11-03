import NavAdmin from "@/components/NavAdmin";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { ubahStatusUlasan, hapusUlasan } from "@/app/admin/actions";

function BintangRating({ nilai }) {
  const jumlah = Math.max(0, Math.min(5, Number(nilai) || 0));
  return <span className="inline-flex items-center gap-0.5 text-harga" aria-label={`Rating ${jumlah} dari 5`}>{Array.from({ length: 5 }, (_, index) => <svg key={index} aria-hidden="true" viewBox="0 0 24 24" className={`h-4 w-4 ${index < jumlah ? "fill-current" : "fill-none"} stroke-current`} strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" /></svg>)}</span>;
}

export default async function HalamanUlasan() {
  const supabase = await createServerAuthClient();
  const { data: daftar } = await supabase.from("ulasan").select("id,nama,rating,komentar,tampil,created_at,produk(nama)").order("created_at", { ascending: false });
  return <div className="flex flex-col gap-6 py-8"><NavAdmin /><h1 className="text-3xl font-extrabold">Moderasi ulasan</h1>
    {!daftar?.length ? <p className="rounded-xl border border-garis p-5 text-teks-lembut">Belum ada ulasan.</p> : <div className="grid gap-4">{daftar.map((item) => <article key={item.id} className="rounded-xl border border-garis p-5"><p className="flex flex-wrap items-center gap-2 font-bold">{item.nama} · {item.produk?.nama} <BintangRating nilai={item.rating} /></p><p className="my-2 text-teks-lembut">{item.komentar}</p><div className="flex gap-2"><form action={ubahStatusUlasan.bind(null, item.id)}><input type="hidden" name="tampil" value={String(!item.tampil)} /><button className="rounded-lg bg-utama px-3 py-2 text-sm font-semibold text-white">{item.tampil ? "Sembunyikan" : "Tampilkan"}</button></form><form action={hapusUlasan.bind(null, item.id)}><button className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-bahaya">Hapus</button></form></div></article>)}</div>}
  </div>;
}
