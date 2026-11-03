"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const BUCKET_FOTO_PRODUK = "produk";
const UKURAN_MAKSIMAL_FOTO = 5 * 1024 * 1024;
const TIPE_FOTO_DIIJINKAN = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp", "image/tiff", "image/avif"];
const percobaanLogin = new Map();
const BATAS_LOGIN = 5;
const JENDELA_LOGIN_MS = 15 * 60 * 1000;
const FIELD_PRODUK = ["nama", "harga", "kategori", "foto_url", "foto_urls", "varian", "status", "stok", "harga_diskon", "badge", "deskripsi"];

async function catatAktivitasAdmin(user, aksi, target = null, detail = null) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin.from("log_aktivitas_admin").insert({
    admin_id: user.id,
    admin_email: user.email || "admin",
    aksi,
    target,
    detail,
  }).select("id");
  if (error) console.error("Log aktivitas admin gagal disimpan.");
}

function parseCsv(teks) {
  const baris = [];
  let nilai = "";
  let row = [];
  let dalamKutip = false;
  for (let i = 0; i < teks.length; i += 1) {
    const karakter = teks[i];
    if (karakter === '"') {
      if (dalamKutip && teks[i + 1] === '"') {
        nilai += '"';
        i += 1;
      } else {
        dalamKutip = !dalamKutip;
      }
    } else if (karakter === "," && !dalamKutip) {
      row.push(nilai.trim());
      nilai = "";
    } else if ((karakter === "\n" || karakter === "\r") && !dalamKutip) {
      if (karakter === "\r" && teks[i + 1] === "\n") i += 1;
      row.push(nilai.trim());
      if (row.some(Boolean)) baris.push(row);
      nilai = "";
      row = [];
    } else {
      nilai += karakter;
    }
  }
  if (nilai || row.length) {
    row.push(nilai.trim());
    if (row.some(Boolean)) baris.push(row);
  }
  return baris;
}

function hasilImpor(query) {
  return `/admin/impor?${new URLSearchParams(query).toString()}`;
}

function ambilVarian(formData) {
  const barisVarian = String(formData.get("varian") ?? "").split(/\r?\n/).map((baris) => baris.trim()).filter(Boolean);
  const varian = [];
  for (const baris of barisVarian) {
    const [nama, hargaTeks] = baris.split("|").map((nilai) => nilai.trim());
    const harga = Number(hargaTeks);
    if (!nama || !Number.isInteger(harga) || harga < 0 || nama.length > 80) return { error: "Format varian harus Nama|Harga, dengan harga bilangan bulat 0 atau lebih." };
    varian.push({ nama, harga });
  }
  return { data: varian };
}

async function simpanVarian(supabase, produkId, varian) {
  const { error: hapusError } = await supabase.from("varian_produk").delete().eq("produk_id", produkId);
  if (hapusError) return hapusError;
  if (!varian.length) return null;
  const { error } = await supabase.from("varian_produk").insert(varian.map((item) => ({ ...item, produk_id: produkId })));
  return error;
}

function redirectValidasiProduk(path, formData, errors) {
  const query = new URLSearchParams({ error: "Periksa isian yang ditandai." });
  Object.entries(errors).forEach(([field, message]) => query.set(`error_${field}`, message));
  FIELD_PRODUK.forEach((field) => {
    const value = formData.get(field);
    if (typeof value === "string") query.set(field, value);
  });
  redirect(`${path}?${query.toString()}`);
}

function ambilKunciRateLimit() {
  return headers().then((requestHeaders) => requestHeaders.get("x-forwarded-for")?.split(",")[0].trim() || "unknown");
}

async function loginDibatasi() {
  const key = await ambilKunciRateLimit();
  const sekarang = Date.now();
  const data = percobaanLogin.get(key);
  if (!data || sekarang - data.mulai > JENDELA_LOGIN_MS) {
    percobaanLogin.set(key, { mulai: sekarang, jumlah: 0 });
    return false;
  }
  return data.jumlah >= BATAS_LOGIN;
}

async function catatLoginGagal() {
  const key = await ambilKunciRateLimit();
  const data = percobaanLogin.get(key) || { mulai: Date.now(), jumlah: 0 };
  data.jumlah += 1;
  percobaanLogin.set(key, data);
}

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
    if (["drive.google.com", "docs.google.com", "lh3.googleusercontent.com", "drive.usercontent.google.com"].includes(parsedUrl.hostname)) {
      const fileId = parsedUrl.pathname.match(/\/file\/d\/([^/]+)/)?.[1]
        || parsedUrl.searchParams.get("id")
        || parsedUrl.pathname.match(/\/d\/([^/]+)/)?.[1];
      if (fileId) {
        return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
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

  if (error || !product?.[0]) {
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
    console.error("Pembersihan foto lama gagal.");
  }
}

export async function buatDeskripsiAI(previousState, formData) {
    const modelGemini = "gemini-3.5-flash-lite";
    const nama = String(formData.get("nama") ?? "").trim();
    const kategori = String(formData.get("kategori") ?? "").trim();
    if (!nama) return { error: "Isi nama produk terlebih dahulu." };
    if (!process.env.GEMINI_API_KEY) return { error: "GEMINI_API_KEY belum dikonfigurasi di environment server." };

    const prompt = `Tulis deskripsi produk dalam bahasa Indonesia untuk katalog UMKM. Nama: ${nama}. Kategori: ${kategori || "umum"}. Buat 2-3 kalimat, jelas, menarik, tanpa klaim kesehatan dan tanpa markdown.`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelGemini}:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
  if (await loginDibatasi()) {
    redirect("/admin/login?error=Terlalu banyak percobaan masuk. Coba lagi dalam 15 menit.");
  }

  const supabase = await createServerAuthClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    await catatLoginGagal();
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
    redirectTo: `${origin}/admin/password/reset`,
  });

  if (error) {
    redirect(`/admin/login/lupa-password?error=${encodeURIComponent("Link reset gagal dikirim. Silakan coba lagi.")}`);
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
    redirect(`/admin/password/reset?error=${encodeURIComponent("Password gagal diubah. Silakan coba lagi.")}`);
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
    redirect(`/admin/password?error=${encodeURIComponent("Password gagal diubah. Silakan coba lagi.")}`);
  }

  redirect("/admin/password?success=Password%20berhasil%20diubah.");
}

export async function ubahStatusProdukAdmin(id, formData) {
  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) redirect("/admin/login?error=Sesi%20admin%20sudah%20berakhir.");
  const aktif = formData.get("aktif") === "true";
  const { error } = await supabase.from("produk").update({ aktif }).eq("id", id);
  if (error) redirect(`/admin?error=${encodeURIComponent("Status produk gagal diubah. Silakan coba lagi.")}`);
  redirect(`/admin?success=${encodeURIComponent(aktif ? "Produk diaktifkan." : "Produk dinonaktifkan.")}`);
}

export async function ubahUrutanProdukAdmin(id, formData) {
  const supabase = await pastikanAdmin();
  const arah = formData.get("arah") === "naik" ? -1 : 1;
  const { data: produk, error: produkError } = await supabase.from("produk").select("id,urutan").eq("id", id).maybeSingle();
  if (produkError || !produk) redirect(`/admin?error=${encodeURIComponent("Produk tidak ditemukan.")}`);
  const { data: tetangga, error: tetanggaError } = await supabase
    .from("produk")
    .select("id,urutan")
    .order("urutan", { ascending: true })
    .order("created_at", { ascending: false });
  if (tetanggaError) redirect(`/admin?error=${encodeURIComponent("Urutan produk gagal dimuat.")}`);
  const index = tetangga.findIndex((item) => item.id === produk.id);
  const tujuan = tetangga[index + arah];
  if (!tujuan) redirect("/admin");
  const { error } = await supabase.from("produk").update({ urutan: index + arah }).eq("id", produk.id);
  if (!error) {
    const hasil = await supabase.from("produk").update({ urutan: index }).eq("id", tujuan.id);
    if (hasil.error) redirect(`/admin?error=${encodeURIComponent("Urutan produk gagal disimpan.")}`);
  }
  if (error) redirect(`/admin?error=${encodeURIComponent("Urutan produk gagal disimpan.")}`);
  redirect(`/admin?success=${encodeURIComponent("Urutan produk berhasil diubah.")}`);
}

export async function tambahProdukAdmin(formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaInput = String(formData.get("harga") ?? "").trim();
  const harga = Number(hargaInput);
  const stok = Number(String(formData.get("stok") ?? "").trim());
  const errors = {};

  if (!nama) errors.nama = "Nama produk wajib diisi.";
  if (!hargaInput || !Number.isFinite(harga) || harga < 0) errors.harga = "Harga wajib diisi dengan angka 0 atau lebih.";
  if (!Number.isInteger(stok) || stok < 0) errors.stok = "Jumlah stok wajib berupa angka bulat 0 atau lebih.";
  if (Object.keys(errors).length) redirectValidasiProduk("/admin/produk/baru", formData, errors);
  const hasilVarian = ambilVarian(formData);
  if (hasilVarian.error) redirect(`/admin/produk/baru?error=${encodeURIComponent(hasilVarian.error)}`);

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
  const { data: product, error } = await supabase.from("produk").insert({
    nama,
    harga,
    kategori: String(formData.get("kategori") ?? "").trim() || null,
    foto_url: foto?.url || normalisasiUrlFoto(formData.get("foto_url")) || daftarFoto[0] || null,
    foto_urls: daftarFoto,
    status: stok === 0 ? "habis" : "tersedia",
    stok,
    harga_diskon: Number(formData.get("harga_diskon")) > 0 ? Number(formData.get("harga_diskon")) : null,
    badge: String(formData.get("badge") ?? "").trim() || null,
    deskripsi: String(formData.get("deskripsi") ?? "").trim() || null,
  });

  if (error) {
    await hapusFotoProduk(foto?.url);
    redirect(`/admin/produk/baru?error=${encodeURIComponent("Produk gagal disimpan. Silakan coba lagi.")}`);
  }

  const varianError = await simpanVarian(supabase, product[0].id, hasilVarian.data);
  if (varianError) redirect(`/admin/produk/baru?error=${encodeURIComponent("Varian produk gagal disimpan.")}`);
  await catatAktivitasAdmin(userData.user, "Tambah produk", "produk", nama);
  redirect(`/admin?success=${encodeURIComponent("Produk berhasil ditambahkan.")}`);
}

export async function ubahProdukAdmin(id, formData) {
  const nama = String(formData.get("nama") ?? "").trim();
  const hargaInput = String(formData.get("harga") ?? "").trim();
  const harga = Number(hargaInput);
  const stok = Number(String(formData.get("stok") ?? "").trim());
  const errors = {};

  if (!nama) errors.nama = "Nama produk wajib diisi.";
  if (!hargaInput || !Number.isFinite(harga) || harga < 0) errors.harga = "Harga wajib diisi dengan angka 0 atau lebih.";
  if (!Number.isInteger(stok) || stok < 0) errors.stok = "Jumlah stok wajib berupa angka bulat 0 atau lebih.";
  if (Object.keys(errors).length) redirectValidasiProduk(`/admin/produk/${id}/ubah`, formData, errors);
  const hasilVarian = ambilVarian(formData);
  if (hasilVarian.error) redirect(`/admin/produk/${id}/ubah?error=${encodeURIComponent(hasilVarian.error)}`);

  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData.user) {
    redirect(`/admin/login?error=${encodeURIComponent("Sesi admin sudah berakhir. Silakan masuk kembali.")}`);
  }

  const { data: produkLama, error: produkLamaError } = await supabase
    .from("produk")
    .select("foto_url,foto_urls")
    .eq("id", id)
    .maybeSingle();
  if (produkLamaError || !produkLama) {
    redirect(`/admin/produk/${id}/ubah?error=${encodeURIComponent("Produk tidak ditemukan.")}`);
  }

  const fileFoto = await ambilFileFoto(formData, `/admin/produk/${id}/ubah`);
  const fotoBaru = await unggahFotoProduk(fileFoto, `/admin/produk/${id}/ubah`);
  const fotoLama = normalisasiUrlFoto(formData.get("foto_url")) || produkLama.foto_url;
  const fotoTambahan = ambilLinkFoto(formData);
  const daftarFotoLama = Array.isArray(produkLama.foto_urls)
    ? produkLama.foto_urls.filter(Boolean)
    : typeof produkLama.foto_urls === "string"
      ? (() => {
        try {
          const hasil = JSON.parse(produkLama.foto_urls);
          return Array.isArray(hasil) ? hasil.filter(Boolean) : [];
        } catch {
          return [];
        }
      })()
      : [];
  const daftarFoto = [...new Set([
    fotoBaru?.url,
    fotoLama,
    ...fotoTambahan,
    ...daftarFotoLama,
  ].filter(Boolean))];
  const { error } = await supabase
    .from("produk")
    .update({
      nama,
      harga,
      kategori: String(formData.get("kategori") ?? "").trim() || null,
      foto_url: fotoBaru?.url || fotoLama || daftarFoto[0] || null,
      foto_urls: daftarFoto,
      status: stok === 0 ? "habis" : "tersedia",
      stok,
      harga_diskon: Number(formData.get("harga_diskon")) > 0 ? Number(formData.get("harga_diskon")) : null,
      badge: String(formData.get("badge") ?? "").trim() || null,
      deskripsi: String(formData.get("deskripsi") ?? "").trim() || null,
    })
    .eq("id", id);

  if (error) {
    await hapusFotoProduk(fotoBaru?.url);
    redirect(`/admin/produk/${id}/ubah?error=${encodeURIComponent("Produk gagal diubah. Silakan coba lagi.")}`);
  }

  if (fotoBaru) {
    await hapusFotoProduk(String(formData.get("foto_url_lama") ?? ""));
  }
  const varianError = await simpanVarian(supabase, id, hasilVarian.data);
  if (varianError) redirect(`/admin/produk/${id}/ubah?error=${encodeURIComponent("Varian produk gagal disimpan.")}`);
  await catatAktivitasAdmin(userData.user, "Ubah produk", `produk:${id}`, nama);
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
    redirect(`/admin?error=${encodeURIComponent("Produk gagal dihapus. Silakan coba lagi.")}`);
  }

  await catatAktivitasAdmin(userData.user, "Hapus produk massal", "produk", `${ids.length} produk`);
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
    redirect(`/admin?error=${encodeURIComponent("Produk gagal dihapus. Silakan coba lagi.")}`);
  }
  await hapusFotoProduk(String(formData?.get("foto_url") ?? ""));
  await catatAktivitasAdmin(userData.user, "Hapus produk", `produk:${id}`);
  redirect(`/admin?success=${encodeURIComponent("Produk berhasil dihapus.")}`);
}

export async function kirimUlasan(formData) {
  const produkId = Number(formData.get("produk_id"));
  const nama = String(formData.get("nama") ?? "").trim();
  const komentar = String(formData.get("komentar") ?? "").trim();
  const rating = Number(formData.get("rating"));
  if (formData.get("website") || !Number.isInteger(produkId) || nama.length < 2 || nama.length > 80 || komentar.length < 3 || komentar.length > 1000 || !Number.isInteger(rating) || rating < 1 || rating > 5) redirect(`/produk/${produkId}?error=Ulasan%20tidak%20valid.`);
  const supabase = createServerSupabaseClient();
  const { count } = await supabase.from("ulasan").select("id", { count: "exact", head: true }).eq("produk_id", produkId).gte("created_at", new Date(Date.now() - 3600000).toISOString());
  if ((count ?? 0) >= 3) redirect(`/produk/${produkId}?error=Batas%20kiriman%20ulasan%20tercapai.`);
  const { error: ulasanError } = await supabase
    .from("ulasan")
    .insert({ produk_id: produkId, nama, komentar, rating });
  if (ulasanError) {
    console.error("Ulasan gagal disimpan:", ulasanError.message);
    redirect(`/produk/${produkId}?error=${encodeURIComponent("Ulasan gagal disimpan. Pastikan migrasi tabel ulasan sudah dijalankan.")}`);
  }
  redirect(`/produk/${produkId}?success=Ulasan%20dikirim%20dan%20menunggu%20moderasi.`);
}

async function pastikanAdmin() {
  const auth = await createServerAuthClient();
  const { data } = await auth.auth.getUser();
  if (!data.user) redirect("/admin/login?error=Sesi%20admin%20sudah%20berakhir.");
  return auth;
}

export async function ubahStatusUlasan(id, formData) {
  const supabase = await pastikanAdmin();
  await supabase.from("ulasan").update({ tampil: formData.get("tampil") === "true" }).eq("id", id);
  redirect("/admin/ulasan");
}

export async function hapusUlasan(id) {
  const supabase = await pastikanAdmin();
  await supabase.from("ulasan").delete().eq("id", id);
  redirect("/admin/ulasan");
}

export async function simpanBanner(formData) {
  const supabase = await pastikanAdmin();
  const id = Number(formData.get("id"));
  const data = { judul: String(formData.get("judul") ?? "").trim(), teks: String(formData.get("teks") ?? "").trim() || null, gambar_url: String(formData.get("gambar_url") ?? "").trim() || null, tautan: String(formData.get("tautan") ?? "").trim() || null, aktif: formData.get("aktif") === "true", updated_at: new Date().toISOString() };
  if (!data.judul || data.judul.length > 120) redirect("/admin?error=Judul%20banner%20wajib%20diisi.");
  if (id) await supabase.from("banner_promo").update(data).eq("id", id);
  else await supabase.from("banner_promo").insert(data);
  redirect("/admin?success=Banner%20promo%20tersimpan.");
}

export async function simpanPengaturanToko(formData) {
  const supabase = await pastikanAdmin();
  const nama = String(formData.get("nama") ?? "").trim();
  const tagline = String(formData.get("tagline") ?? "").trim();
  const nomorWhatsApp = String(formData.get("nomor_whatsapp") ?? "").replace(/[\s()-]/g, "").replace(/^\+/, "");
  const alamat = String(formData.get("alamat") ?? "").trim();
  const jamBuka = String(formData.get("jam_buka") ?? "").trim();
  const errors = {};

  if (nama.length < 2 || nama.length > 120) errors.nama = "Nama toko harus 2–120 karakter.";
  if (tagline.length < 2 || tagline.length > 240) errors.tagline = "Tagline harus 2–240 karakter.";
  if (!/^[1-9][0-9]{7,14}$/.test(nomorWhatsApp)) errors.nomor_whatsapp = "Nomor WhatsApp harus format internasional, contoh 6281234567890.";
  if (alamat.length < 2 || alamat.length > 240) errors.alamat = "Alamat harus 2–240 karakter.";
  if (jamBuka.length < 2 || jamBuka.length > 120) errors.jam_buka = "Jam buka harus 2–120 karakter.";
  if (Object.keys(errors).length) {
    const query = new URLSearchParams({ error: "Periksa pengaturan toko." });
    Object.entries(errors).forEach(([field, message]) => query.set(`error_${field}`, message));
    for (const field of ["nama", "tagline", "nomor_whatsapp", "alamat", "jam_buka"]) query.set(field, String(formData.get(field) ?? ""));
    redirect(`/admin?${query.toString()}`);
  }

  const { error } = await supabase.from("pengaturan_toko").upsert({
    id: 1,
    nama,
    tagline,
    nomor_whatsapp: nomorWhatsApp,
    alamat,
    jam_buka: jamBuka,
    updated_at: new Date().toISOString(),
  });
  if (error) redirect(`/admin?error=${encodeURIComponent("Pengaturan toko gagal disimpan.")}`);
  redirect(`/admin?success=${encodeURIComponent("Pengaturan toko berhasil disimpan.")}`);
}

export async function tambahAdmin(formData) {
  const supabase = await pastikanAdmin();
  const { data: current } = await supabase.auth.getUser();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 8) {
    redirect(`/admin/akun?error=${encodeURIComponent("Email valid dan password minimal 8 karakter wajib diisi.")}`);
  }
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
  if (error) redirect(`/admin/akun?error=${encodeURIComponent("Akun admin gagal dibuat. Pastikan email belum terdaftar.")}`);
  await catatAktivitasAdmin(current.user, "Tambah akun admin", `admin:${data.user.id}`, email);
  redirect(`/admin/akun?success=${encodeURIComponent("Akun admin berhasil ditambahkan.")}`);
}

export async function ubahStatusAdmin(id, formData) {
  const supabase = await pastikanAdmin();
  const { data: current } = await supabase.auth.getUser();
  if (!id || id === current.user.id) redirect(`/admin/akun?error=${encodeURIComponent("Akun yang sedang digunakan tidak dapat dinonaktifkan.")}`);
  const nonaktif = formData.get("nonaktif") === "true";
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, { ban_duration: nonaktif ? "876000h" : "none" });
  if (error) redirect(`/admin/akun?error=${encodeURIComponent("Status akun gagal diubah.")}`);
  await catatAktivitasAdmin(current.user, nonaktif ? "Nonaktifkan akun admin" : "Aktifkan akun admin", `admin:${id}`);
  redirect(`/admin/akun?success=${encodeURIComponent(nonaktif ? "Akun admin dinonaktifkan." : "Akun admin diaktifkan.")}`);
}

export async function hapusAdmin(id) {
  const supabase = await pastikanAdmin();
  const { data: current } = await supabase.auth.getUser();
  if (!id || id === current.user.id) redirect(`/admin/akun?error=${encodeURIComponent("Akun yang sedang digunakan tidak dapat dihapus.")}`);
  const admin = createSupabaseAdminClient();
  const { error } = await admin.auth.admin.deleteUser(id);
  if (error) redirect(`/admin/akun?error=${encodeURIComponent("Akun admin gagal dihapus.")}`);
  await catatAktivitasAdmin(current.user, "Hapus akun admin", `admin:${id}`);
  redirect(`/admin/akun?success=${encodeURIComponent("Akun admin berhasil dihapus.")}`);
}

export async function imporProdukCSV(formData) {
  const supabase = await pastikanAdmin();
  const { data: current } = await supabase.auth.getUser();
  const file = formData.get("file");
  if (!file || typeof file === "string" || file.size === 0) redirect(hasilImpor({ error: "Pilih file CSV terlebih dahulu." }));
  if (file.size > 2 * 1024 * 1024) redirect(hasilImpor({ error: "Ukuran CSV maksimal 2 MB." }));

  const rows = parseCsv(await file.text());
  const header = (rows.shift() || []).map((item) => item.toLowerCase().replace(/^\uFEFF/, ""));
  const wajib = ["nama", "harga"];
  if (!wajib.every((kolom) => header.includes(kolom))) redirect(hasilImpor({ error: "CSV wajib memiliki kolom nama dan harga." }));
  if (rows.length > 500) redirect(hasilImpor({ error: "Maksimal 500 baris per impor." }));

  const produk = [];
  const errors = [];
  rows.forEach((row, index) => {
    const data = Object.fromEntries(header.map((kolom, kolomIndex) => [kolom, row[kolomIndex] || ""]));
    const nama = data.nama.trim();
    const harga = Number(data.harga);
    if (!nama || nama.length > 200) errors.push(`Baris ${index + 2}: nama wajib diisi (maksimal 200 karakter).`);
    else if (!Number.isInteger(harga) || harga < 0) errors.push(`Baris ${index + 2}: harga harus bilangan bulat 0 atau lebih.`);
    else produk.push({
      nama,
      harga,
      kategori: data.kategori.trim() || null,
      deskripsi: data.deskripsi.trim() || null,
      foto_url: normalisasiUrlFoto(data.foto_url) || null,
      status: ["tersedia", "habis"].includes(data.status) ? data.status : "tersedia",
      harga_diskon: Number(data.harga_diskon) > 0 ? Number(data.harga_diskon) : null,
      badge: data.badge.trim() || null,
      aktif: data.aktif !== "false",
    });
  });
  if (!produk.length) {
    redirect(hasilImpor({ error: errors.slice(0, 8).join(" | ") || "Tidak ada baris valid untuk diimpor.", valid: 0, gagal: errors.length }));
  }
  const { error } = await supabase.from("produk").insert(produk);
  if (error) redirect(hasilImpor({ error: "Data CSV gagal disimpan. Periksa format kolom dan data.", valid: 0, gagal: rows.length }));
  await catatAktivitasAdmin(current.user, "Impor produk CSV", "produk", `${produk.length} produk`);
  const ringkasan = `Berhasil mengimpor ${produk.length} produk${errors.length ? `; ${errors.length} baris ditolak.` : "."}`;
  redirect(hasilImpor({ success: ringkasan, detail: errors.slice(0, 8).join(" | "), valid: produk.length, gagal: errors.length }));
}
