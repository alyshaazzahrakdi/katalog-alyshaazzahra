import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { resetPasswordAdmin } from "@/app/admin/actions";
import Link from "next/link";

export default async function HalamanResetPassword({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-12 sm:py-20">
      <div className="overflow-hidden rounded-2xl border border-garis bg-latar shadow-[0_20px_60px_rgba(31,107,79,0.10)]">
        <div className="bg-permukaan px-6 py-8 sm:px-8">
          <p className="text-sm font-semibold tracking-wide text-utama">Keamanan akun</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Buat password baru</h1>
          <p className="mt-2 text-sm leading-6 text-teks-lembut">
            Gunakan minimal 8 karakter agar akun admin tetap terlindungi.
          </p>
        </div>
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <form action={resetPasswordAdmin} className="flex flex-col gap-4">
            <Input
              label="Password baru"
              name="password_baru"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Input
              label="Ulangi password baru"
              name="konfirmasi_password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
            />
            <Tombol type="submit" className="mt-2 w-full">Simpan password baru</Tombol>
          </form>
          <p className="text-center text-xs leading-5 text-teks-lembut">
            Setelah berhasil, Anda akan diarahkan kembali ke halaman masuk.
          </p>
          <Link href="/admin/login" className="text-center text-sm font-semibold text-teks-lembut hover:text-utama">
            Kembali ke halaman masuk
          </Link>
        </div>
      </div>
      {pesanError ? (
        <p role="alert" className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-bahaya">
          {pesanError}
        </p>
      ) : null}
    </div>
  );
}
