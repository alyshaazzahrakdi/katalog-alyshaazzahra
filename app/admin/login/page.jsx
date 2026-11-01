import Link from "next/link";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { loginAdmin } from "@/app/admin/actions";
import AuthLayout from "@/components/AuthLayout";

export default async function HalamanLogin({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";
  const pesanSukses = typeof params?.success === "string" ? params.success : "";

  return (
    <AuthLayout
      eyebrow="Area pemilik toko"
      title="Selamat datang kembali."
      description="Masuk untuk mengatur produk dan memastikan katalog Anda selalu siap dilihat pelanggan."
      footer={
        <Link href="/" className="text-sm font-semibold text-teks-lembut hover:text-utama">
          ← Kembali ke katalog
        </Link>
      }
    >
      <form action={loginAdmin} className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Tombol type="submit" className="mt-3 w-full">
          Masuk ke dashboard
        </Tombol>
      </form>
      <Link
        href="/admin/login/lupa-password"
        className="mt-5 block text-center text-sm font-semibold text-teks-lembut hover:text-utama"
      >
        Lupa password?
      </Link>
      {pesanError ? (
        <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-bahaya">
          {pesanError}
        </p>
      ) : null}
      {pesanSukses ? (
        <p className="mt-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-utama">
          {pesanSukses}
        </p>
      ) : null}
    </AuthLayout>
  );
}
