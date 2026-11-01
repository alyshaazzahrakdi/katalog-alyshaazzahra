import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { kirimLinkResetPassword } from "@/app/admin/actions";

export default async function HalamanLupaPassword({ searchParams }) {
  const params = await searchParams;
  const pesanError = typeof params?.error === "string" ? params.error : "";
  const pesanSukses = typeof params?.success === "string" ? params.success : "";

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 py-12">
      <div>
        <h1 className="text-2xl font-extrabold">Lupa password</h1>
        <p className="mt-1 text-sm text-teks-lembut">Masukkan email admin untuk menerima link reset password.</p>
      </div>
      <form action={kirimLinkResetPassword} className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" autoComplete="email" required />
        <Tombol type="submit">Kirim link reset</Tombol>
      </form>
      {pesanError ? (
        <p role="alert" className="text-bahaya">
          {pesanError}
        </p>
      ) : null}
      {pesanSukses ? <p>{pesanSukses}</p> : null}
    </div>
  );
}
