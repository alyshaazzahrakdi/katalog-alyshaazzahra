import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { kirimLinkResetPassword } from "@/app/admin/actions";
import Link from "next/link";

export default async function HalamanLupaPassword({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";
  const pesanSukses = typeof params?.success === "string" ? params.success : "";

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-12 sm:py-20">
      <div className="overflow-hidden rounded-2xl border border-garis bg-latar shadow-[0_20px_60px_rgba(31,107,79,0.10)]">
        <div className="bg-permukaan px-6 py-8 sm:px-8">
          <p className="text-sm font-semibold tracking-wide text-utama">Pemulihan akun</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Lupa password?</h1>
          <p className="mt-2 text-sm leading-6 text-teks-lembut">
            Masukkan email admin dan kami akan mengirimkan link untuk membuat password baru.
          </p>
        </div>
        <div className="flex flex-col gap-5 p-6 sm:p-8">
          <form action={kirimLinkResetPassword} className="flex flex-col gap-4">
            <Input label="Email admin" name="email" type="email" autoComplete="email" required />
            <Tombol type="submit" className="mt-2 w-full">Kirim link reset</Tombol>
          </form>
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
      {pesanSukses ? (
        <p className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-utama">
          {pesanSukses}
        </p>
      ) : null}
    </div>
  );
}
