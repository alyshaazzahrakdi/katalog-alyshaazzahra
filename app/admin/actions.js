"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const BUCKET_FOTO_PRODUK = "produk";
const UKURAN_MAKSIMAL_FOTO = 5 * 1024 * 1024;
const TIPE_FOTO_DIIJINKAN = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff", "image/avif"];

function cocokDenganAwalan(bytes, awalan) {
  return awalan.every((nilai, index) => bytes[index] === nilai);
}

function deteksiTipeFoto(bytes) {
  if (cocokDenganAwalan(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (cocokDenganAwalan(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (cocokDenganAwalan(bytes, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (cocokDenganAwalan(bytes, [0x42, 0x4d])) return "image/bmp";
  if (cocokDenganAwalan(bytes, [0x49, 0x49, 0x2a, 0x00]) || cocokDenganAwalan(bytes, [0x4d, 0x4d, 0x00, 0x2a])) return "image/tiff";
  if (cocokDenganAwalan(bytes, [0x52, 0x49, 0x46, 0x46]) && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP") return "image/webp";
  if (String.fromCharCode(...bytes.slice(4, 12)) === "ftypavif") return "image/avif";
  return null;
}

function normalisasiUrlFoto(nilai) {
  const url = String(nilai ?? "").trim();

  if (!url) {
    return null;
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "drive.google.com") {
      const fileId = parsedUrl.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] || parsedUrl.searchParams.get("id");
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`;
      }
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return null;
    }
  } catch {
    if (!url.startsWith("/")) {
      return null;
    }
  }

  return url;
}

function ambilLinkFoto(formData) {
  return String(formData.get("foto_urls") ?? "").split(/\r?\n/).map((item) => normalisasiUrlFoto(item)).filter(Boolean);
}

async function validasiFileFoto(file, halamanError) {
  if (!file || typeof file === "string" || file.size === 0) {
    return null;
  }

  if (file.size > UKURAN_MAKSIMAL_FOTO) {
    redirect(`${halamanError}?error=${encodeURIComponent("Ukuran foto maksimal 5 MB.")}`);
  }

  const tipeFoto = deteksiTipeFoto(new Uint8Array(await file.arrayBuffer()));
  if (!tipeFoto) {
    redirect(`${halamanError}?error=${encodeURIComponent("File bukan gambar yang valid. Word, PHP, dan file yang hanya diganti ekstensinya tidak diperbolehkan.")}`);
  }

  return { file, tipeFoto };
}

async function ambilFileFoto(formData, halamanError) {
  return validasiFileFoto(formData.get("foto"), halamanError);
}

async function unggahFotoProduk(foto, halamanError) {
  if (!foto) {
    return null;
  }

  const ekstensi = foto.tipeFoto.split("/")[1].replace("jpeg", "jpg").replace("tiff", "tif");
  const path = `${crypto.randomUUID()}.${ekstensi}`;
  const supabase = createServerSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET_FOTO_PRODUK).upload(path, foto.file, {
    contentType: foto.tipeFoto,
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

export async function buatDeskripsiAI(previousState, formData) {
    const nama = String(formData.get("nama") ?? "").trim();
    const kategori = String(formData.get("kategori") ?? "").trim();
    if (!nama) return { error: "Isi nama produk terlebih dahulu." };
    if (!process.env.GEMINI_API_KEY) return { error: "GEMINI_API_KEY belum dikonfigurasi di environment server." };

    const prompt = `Tulis deskripsi produk dalam bahasa Indonesia untuk katalog UMKM. Nama: ${nama}. Kategori: ${kategori || "umum"}. Buat 2-3 kalimat, jelas, menarik, tanpa klaim kesehatan dan tanpa markdown.`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        cache: "no-store",
      },
    );
    if (!response.ok) return { error: "Deskripsi AI gagal dibuat. Periksa konfigurasi Gemini API." };
    const data = await response.json();
    const description = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    return description ? { description } : { error: "Gemini tidak mengembalikan deskripsi." };
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

  const fileFoto = formData.getAll("foto").filter((file) => file && typeof file !== "string" && file.size > 0);
  const fotoUpload = [];
  for (const file of fileFoto) {
    fotoUpload.push(await unggahFotoProduk(await validasiFileFoto(file, "/admin/produk/baru"), "/admin/produk/baru"));
  }
  const daftarFoto = [...fotoUpload.map((foto) => foto.url), ...ambilLinkFoto(formData)];
  const foto = fotoUpload[0];
  const { error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori: String(formData.get("kategori") ?? "").trim() || null,
    foto_url: foto?.url || normalisasiUrlFoto(formData.get("foto_url")) || daftarFoto[0] || null,
    foto_urls: daftarFoto,
    status: ["tersedia", "habis"].includes(formData.get("status")) ? formData.get("status") : "tersedia",
    harga_diskon: Number(formData.get("harga_diskon")) > 0 ? Number(formData.get("harga_diskon")) : null,
    badge: String(formData.get("badge") ?? "").trim() || null,
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

  const fileFoto = await ambilFileFoto(formData, `/admin/produk/${id}/ubah`);
  const fotoBaru = await unggahFotoProduk(fileFoto, `/admin/produk/${id}/ubah`);
  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori: String(formData.get("kategori") ?? "").trim() || null,
      foto_url: fotoBaru?.url || normalisasiUrlFoto(formData.get("foto_url")),
      foto_urls: [...(fotoBaru ? [fotoBaru.url] : []), ...ambilLinkFoto(formData)],
      status: ["tersedia", "habis"].includes(formData.get("status")) ? formData.get("status") : "tersedia",
      harga_diskon: Number(formData.get("harga_diskon")) > 0 ? Number(formData.get("harga_diskon")) : null,
      badge: String(formData.get("badge") ?? "").trim() || null,
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
