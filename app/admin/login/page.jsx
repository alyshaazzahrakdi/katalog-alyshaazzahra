import Link from "next/link";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { loginAdmin } from "@/app/admin/actions";

export default async function HalamanLogin({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";
  const pesanSukses = typeof params?.success === "string" ? params.success : "";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold">Masuk admin</h1>
        <p className="mt-1 text-sm text-teks-lembut">Khusus pemilik toko untuk mengelola produk.</p>
      </div>
      <form action={loginAdmin} className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Input
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        <Tombol type="submit">Masuk</Tombol>
      </form>
      <Link href="/admin/login/lupa-password" className="text-sm text-teks-lembut underline underline-offset-4 hover:text-utama">
        Lupa password?
      </Link>
      {pesanError ? (
        <p role="alert" className="text-bahaya">
          {pesanError}
        </p>
      ) : null}
      {pesanSukses ? <p>{pesanSukses}</p> : null}
    </div>
  );
}
