import NavAdmin from "@/components/NavAdmin";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { tambahAdmin, ubahStatusAdmin, hapusAdmin } from "@/app/admin/actions";
import { createServerAuthClient } from "@/lib/supabase/auth";

export default async function HalamanAkunAdmin({ searchParams }) {
  const params = await searchParams;
  const auth = await createServerAuthClient();
  const { data: current } = await auth.auth.getUser();
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 100 });
  if (error) throw error;
  const users = data.users || [];
  return <div className="flex flex-col gap-6 py-8">
    <NavAdmin />
    <h1 className="text-2xl font-extrabold">Kelola akun admin</h1>
    {params?.error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-bahaya">{params.error}</p> : null}
    {params?.success ? <p role="status" className="rounded-xl bg-green-50 px-4 py-3 text-utama">✓ {params.success}</p> : null}
    <section className="rounded-2xl border border-garis bg-latar p-5">
      <h2 className="font-extrabold">Tambah admin</h2>
      <form action={tambahAdmin} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <input required type="email" name="email" placeholder="Email admin" className="rounded-lg border border-garis px-3 py-2.5" />
        <input required minLength="8" type="password" name="password" placeholder="Password minimal 8 karakter" className="rounded-lg border border-garis px-3 py-2.5" />
        <button className="rounded-lg bg-utama px-4 py-2.5 font-semibold text-white">Tambah admin</button>
      </form>
    </section>
    <section className="overflow-x-auto rounded-2xl border border-garis">
      <table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-permukaan"><tr><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aksi</th></tr></thead><tbody>
        {users.map((user) => {
          const nonaktif = Boolean(user.banned_until && new Date(user.banned_until) > new Date());
          const sendiri = user.id === current.user?.id;
          return <tr key={user.id} className="border-t border-garis"><td className="px-4 py-3 font-semibold">{user.email}</td><td className="px-4 py-3">{nonaktif ? "Nonaktif" : "Aktif"}{sendiri ? " (Anda)" : ""}</td><td className="px-4 py-3"><div className="flex gap-2">{!sendiri ? <><form action={ubahStatusAdmin.bind(null, user.id)}><input type="hidden" name="nonaktif" value={String(!nonaktif)} /><button className="rounded-lg border border-garis px-3 py-2 font-semibold">{nonaktif ? "Aktifkan" : "Nonaktifkan"}</button></form><form action={hapusAdmin.bind(null, user.id)}><button className="rounded-lg border border-garis px-3 py-2 font-semibold text-bahaya">Hapus</button></form></> : null}</div></td></tr>;
        })}
      </tbody></table>
    </section>
  </div>;
}
