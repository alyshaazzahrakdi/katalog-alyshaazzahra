"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerAuthClient } from "@/lib/supabase/auth";

export async function loginAdmin(formData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/admin/login?error=Email%20dan%20password%20wajib%20diisi.");
  }

  const supabase = await createServerAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect("/admin/login?error=Email%20atau%20password%20salah.");
  }

  redirect("/admin");
}

export async function logoutAdmin() {
  const supabase = await createServerAuthClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function kirimLinkResetPassword(formData) {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    redirect(`/admin/login/lupa-password?error=${encodeURIComponent("Email wajib diisi.")}`);
  }

  const origin = (await headers()).get("origin");
  if (!origin) {
    redirect(`/admin/login/lupa-password?error=${encodeURIComponent("Alamat aplikasi tidak dapat ditentukan.")}`);
  }

  const supabase = await createServerAuthClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/admin/password/reset`,
  });

  if (error) {
    redirect(`/admin/login/lupa-password?error=${encodeURIComponent("Link reset gagal dikirim. " + error.message)}`);
  }

  redirect(`/admin/login/lupa-password?success=${encodeURIComponent("Link reset password sudah dikirim ke email.")}`);
}

export async function resetPasswordAdmin(formData) {
  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasiPassword = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    redirect(`/admin/password/reset?error=${encodeURIComponent("Password baru minimal 8 karakter.")}`);
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect(`/admin/password/reset?error=${encodeURIComponent("Konfirmasi password tidak sama.")}`);
  }

  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(`/admin/login?error=${encodeURIComponent("Link reset tidak valid atau sudah kedaluwarsa.")}`);
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    redirect(`/admin/password/reset?error=${encodeURIComponent("Password gagal diubah. " + error.message)}`);
  }

  await supabase.auth.signOut();
  redirect(`/admin/login?success=${encodeURIComponent("Password berhasil diubah. Silakan masuk dengan password baru.")}`);
}

export async function ubahPasswordAdmin(formData) {
  const passwordBaru = String(formData.get("password_baru") ?? "");
  const konfirmasiPassword = String(formData.get("konfirmasi_password") ?? "");

  if (passwordBaru.length < 8) {
    redirect("/admin/password?error=Password%20baru%20minimal%208%20karakter.");
  }

  if (passwordBaru !== konfirmasiPassword) {
    redirect("/admin/password?error=Konfirmasi%20password%20tidak%20sama.");
  }

  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect("/admin/login?error=Sesi%20admin%20sudah%20berakhir.%20Silakan%20masuk%20kembali.");
  }

  const { error } = await supabase.auth.updateUser({ password: passwordBaru });

  if (error) {
    redirect(`/admin/password?error=${encodeURIComponent("Password gagal diubah. " + error.message)}`);
  }

  redirect("/admin/password?success=Password%20berhasil%20diubah.");
}
