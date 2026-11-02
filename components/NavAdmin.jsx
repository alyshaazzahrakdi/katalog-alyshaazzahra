import Link from "next/link";
import { logoutAdmin } from "@/app/admin/actions";

export default function NavAdmin() {
  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-2xl border border-garis bg-latar p-2 text-sm shadow-sm">
      <Link href="/admin" className="rounded-xl bg-utama px-4 py-2.5 font-bold text-white">
        Dashboard
      </Link>
      <Link href="/admin/password" className="rounded-xl px-4 py-2.5 font-semibold text-teks-lembut hover:bg-permukaan hover:text-utama">
        Ganti password
      </Link>
      <Link href="/admin/ulasan" className="rounded-xl px-4 py-2.5 font-semibold text-teks-lembut hover:bg-permukaan hover:text-utama">Moderasi ulasan</Link>
      <form action={logoutAdmin} className="ml-auto">
        <button type="submit" className="rounded-xl px-4 py-2.5 font-semibold text-teks-lembut hover:bg-red-50 hover:text-bahaya">
          Keluar
        </button>
      </form>
    </nav>
  );
}
