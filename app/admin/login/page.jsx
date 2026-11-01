import Link from "next/link";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { loginAdmin } from "@/app/admin/actions";

export default async function HalamanLogin({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";
  const pesanSukses = typeof params?.success === "string" ? params.success : "";

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-12 sm:py-20">
      <div className="overflow-hidden rounded-2xl border border-garis bg-latar shadow-[0_20px_60px_rgba(31,107,79,0.10)]">
        <div className="bg-utama px-6 py-8 text-white sm:px-8">
          <p className="text-sm font-semibold tracking-wide text-white/75">Area pemilik toko</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Masuk admin</h1>
          <p className="mt-2 max-w-xs text-sm leading-6 text-white/80">
            Kelola katalog produk dengan mudah dan aman.
          </p>
        </div>
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <form action={loginAdmin} className="flex flex-col gap-4">
            <Input label="Email" name="email" type="email" autoComplete="email" required />
            <Input
              label="Password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
            <Tombol type="submit" className="mt-2 w-full">
              Masuk ke dashboard
            </Tombol>
          </form>
          <Link
            href="/admin/login/lupa-password"
            className="text-center text-sm font-semibold text-teks-lembut underline underline-offset-4 hover:text-utama"
          >
            Lupa password?
          </Link>
        </div>
      </div>
      {pesanError ? (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-bahaya">
          {pesanError}
        </p>
      ) : null}
      {pesanSukses ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-utama">
          {pesanSukses}
        </p>
      ) : null}
    </div>
  );
}
