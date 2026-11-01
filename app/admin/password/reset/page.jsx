import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { resetPasswordAdmin } from "@/app/admin/actions";

export default async function HalamanResetPassword({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold">Buat password baru</h1>
        <p className="mt-1 text-sm text-teks-lembut">Password baru minimal 8 karakter.</p>
      </div>
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
        <Tombol type="submit">Simpan password</Tombol>
      </form>
      {pesanError ? (
        <p role="alert" className="text-bahaya">
          {pesanError}
        </p>
      ) : null}
    </div>
  );
}
