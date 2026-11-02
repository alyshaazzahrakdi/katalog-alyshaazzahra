import NavAdmin from "@/components/NavAdmin";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { ubahStatusUlasan, hapusUlasan } from "@/app/admin/actions";

export default async function HalamanUlasan() {
  const supabase = await createServerAuthClient();
  const { data: daftar } = await supabase.from("ulasan").select("id,nama,rating,komentar,tampil,created_at,produk(nama)").order("created_at", { ascending: false });
  return <div className="flex flex-col gap-6 py-8"><NavAdmin /><h1 className="text-3xl font-extrabold">Moderasi ulasan</h1>
    {!daftar?.length ? <p className="rounded-xl border border-garis p-5 text-teks-lembut">Belum ada ulasan.</p> : <div className="grid gap-4">{daftar.map((item) => <article key={item.id} className="rounded-xl border border-garis p-5"><p className="font-bold">{item.nama} · {item.produk?.nama} <span className="text-harga">{"★".repeat(item.rating)}</span></p><p className="my-2 text-teks-lembut">{item.komentar}</p><div className="flex gap-2"><form action={ubahStatusUlasan.bind(null, item.id)}><input type="hidden" name="tampil" value={String(!item.tampil)} /><button className="rounded-lg bg-utama px-3 py-2 text-sm font-semibold text-white">{item.tampil ? "Sembunyikan" : "Tampilkan"}</button></form><form action={hapusUlasan.bind(null, item.id)}><button className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-bahaya">Hapus</button></form></div></article>)}</div>}
  </div>;
}
