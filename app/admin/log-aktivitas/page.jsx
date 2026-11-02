import NavAdmin from "@/components/NavAdmin";
import { createServerAuthClient } from "@/lib/supabase/auth";

export default async function HalamanLogAktivitas() {
  const supabase = await createServerAuthClient();
  const { data, error } = await supabase.from("log_aktivitas_admin").select("id,admin_email,aksi,target,detail,created_at").order("created_at", { ascending: false }).limit(50);
  if (error) throw error;
  return <div className="flex flex-col gap-6 py-8"><NavAdmin /><div><h1 className="text-2xl font-extrabold">Log aktivitas admin</h1><p className="mt-1 text-sm text-teks-lembut">50 aktivitas terbaru.</p></div><div className="overflow-x-auto rounded-2xl border border-garis"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-permukaan"><tr><th className="px-4 py-3">Waktu</th><th className="px-4 py-3">Admin</th><th className="px-4 py-3">Aksi</th><th className="px-4 py-3">Detail</th></tr></thead><tbody>{(data || []).map((item) => <tr key={item.id} className="border-t border-garis"><td className="px-4 py-3 text-teks-lembut">{new Date(item.created_at).toLocaleString("id-ID")}</td><td className="px-4 py-3">{item.admin_email}</td><td className="px-4 py-3 font-semibold">{item.aksi}</td><td className="px-4 py-3">{[item.target, item.detail].filter(Boolean).join(" — ")}</td></tr>)}</tbody></table></div></div>;
}
