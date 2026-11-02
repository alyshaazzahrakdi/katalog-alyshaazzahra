"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BUCKET_FOTO_PRODUK = "produk";
const UKURAN_MAKSIMAL_FOTO = 5 * 1024 * 1024;
const TIPE_FOTO_DIIJINKAN = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function ambilFileFoto(formData, halamanError) {
  const file = formData.get("foto");

  if (!file || typeof file === "string" || file.size === 0) {
    return null;
  }

  if (!TIPE_FOTO_DIIJINKAN.includes(file.type)) {
    redirect(`${halamanError}?error=${encodeURIComponent("Foto harus berformat JPG, PNG, WEBP, atau GIF.")}`);
  }

  if (file.size > UKURAN_MAKSIMAL_FOTO) {
    redirect(`${halamanError}?error=${encodeURIComponent("Ukuran foto maksimal 5 MB.")}`);
  }

  return file;
}

async function unggahFotoProduk(file, halamanError) {
  if (!file) {
    return null;
  }

  const ekstensi = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${crypto.randomUUID()}.${ekstensi}`;
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET_FOTO_PRODUK).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });

  if (error) {
    redirect(`${halamanError}?error=${encodeURIComponent("Foto gagal diunggah. Pastikan bucket Storage 'produk' sudah dibuat dan bersifat publik.")}`);
  }

  const { data } = supabase.storage.from(BUCKET_FOTO_PRODUK).getPublicUrl(path);
  return { path, url: data.publicUrl };
}

async function hapusFotoProduk(url) {
  if (!url) {
    return;
  }

  const penanda = `/storage/v1/object/public/${BUCKET_FOTO_PRODUK}/`;
  const posisi = url.indexOf(penanda);
  if (posisi === -1) {
    return;
  }

  const path = decodeURIComponent(url.slice(posisi + penanda.length));
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET_FOTO_PRODUK).remove([path]);
  if (error) {
    console.error("Foto produk lama gagal dihapus:", error.message);
  }
}

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

export async function tambahProdukAdmin(formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const harga = Number(formData.get("harga"));

  if (!nama || !Number.isFinite(harga) || harga < 0) {
    redirect(`/admin/produk/baru?error=${encodeURIComponent("Nama dan harga produk wajib diisi dengan benar.")}`);
  }

  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(`/admin/login?error=${encodeURIComponent("Sesi admin sudah berakhir. Silakan masuk kembali.")}`);
  }

  const foto = await unggahFotoProduk(ambilFileFoto(formData, "/admin/produk/baru"), "/admin/produk/baru");
  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori: String(formData.get("kategori") ?? "").trim() || null,
    foto_url: foto?.url || String(formData.get("foto_url") ?? "").trim() || null,
    deskripsi: String(formData.get("deskripsi") ?? "").trim() || null,
  });

  if (error) {
    await hapusFotoProduk(foto?.url);
    redirect(`/admin/produk/baru?error=${encodeURIComponent("Produk gagal disimpan. " + error.message)}`);
  }

  redirect(`/admin?success=${encodeURIComponent("Produk berhasil ditambahkan.")}`);
}

export async function ubahProdukAdmin(id, formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const harga = Number(formData.get("harga"));

  if (!nama || !Number.isFinite(harga) || harga < 0) {
    redirect(`/admin/produk/${id}/ubah?error=${encodeURIComponent("Nama dan harga produk wajib diisi dengan benar.")}`);
  }

  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(`/admin/login?error=${encodeURIComponent("Sesi admin sudah berakhir. Silakan masuk kembali.")}`);
  }

  const fileFoto = ambilFileFoto(formData, `/admin/produk/${id}/ubah`);
  const fotoBaru = await unggahFotoProduk(fileFoto, `/admin/produk/${id}/ubah`);
  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori: String(formData.get("kategori") ?? "").trim() || null,
      foto_url: fotoBaru?.url || String(formData.get("foto_url") ?? "").trim() || null,
      deskripsi: String(formData.get("deskripsi") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    await hapusFotoProduk(fotoBaru?.url);
    redirect(`/admin/produk/${id}/ubah?error=${encodeURIComponent("Produk gagal diubah. " + error.message)}`);
  }

  if (fotoBaru) {
    await hapusFotoProduk(String(formData.get("foto_url_lama") ?? ""));
  }
  redirect(`/admin?success=${encodeURIComponent("Produk berhasil diubah.")}`);
}

export async function hapusProdukTerpilihAdmin(formData) {
  const ids = formData
    .getAll("produk_id")
    .map((id) => String(id).trim())
    .filter(Boolean);

  if (ids.length === 0) {
    redirect(`/admin?error=${encodeURIComponent("Pilih minimal satu produk untuk dihapus.")}`);
  }

  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(`/admin/login?error=${encodeURIComponent("Sesi admin sudah berakhir. Silakan masuk kembali.")}`);
  }

  const { error } = await supabase.from("produk").delete().in("id", ids);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent("Produk gagal dihapus. " + error.message)}`);
  }

  redirect(`/admin?success=${encodeURIComponent(`${ids.length} produk berhasil dihapus.`)}`);
}

export async function hapusProdukAdmin(id, formData) {
  if (!id) {
    redirect(`/admin?error=${encodeURIComponent("Produk yang akan dihapus tidak valid.")}`);
  }

  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(`/admin/login?error=${encodeURIComponent("Sesi admin sudah berakhir. Silakan masuk kembali.")}`);
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);

  if (error) {
    redirect(`/admin?error=${encodeURIComponent("Produk gagal dihapus. " + error.message)}`);
  }

  await hapusFotoProduk(String(formData?.get("foto_url") ?? ""));
  redirect(`/admin?success=${encodeURIComponent("Produk berhasil dihapus.")}`);
}
