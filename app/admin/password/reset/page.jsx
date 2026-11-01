import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { resetPasswordAdmin } from "@/app/admin/actions";
import Link from "next/link";
import AuthLayout from "@/components/AuthLayout";

export default async function HalamanResetPassword({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";

  return (
    <AuthLayout
      eyebrow="Keamanan akun"
      title="Buat password baru."
      description="Buat password baru minimal 8 karakter untuk melindungi akses ke dashboard toko."
      footer={
        <Link href="/admin/login" className="text-sm font-semibold text-teks-lembut hover:text-utama">
          ← Kembali ke halaman masuk
        </Link>
      }
    >
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
        <Tombol type="submit" className="mt-3 w-full">Simpan password baru</Tombol>
      </form>
      <p className="mt-5 text-center text-xs leading-5 text-teks-lembut">
        Setelah berhasil, Anda akan diarahkan kembali ke halaman masuk.
      </p>
      {pesanError ? (
        <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-bahaya">
          {pesanError}
        </p>
      ) : null}
    </AuthLayout>
  );
}
