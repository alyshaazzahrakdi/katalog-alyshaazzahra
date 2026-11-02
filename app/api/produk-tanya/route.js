import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const batasPertanyaan = new Map();
const JENDELA_RATE_LIMIT = 15 * 60 * 1000;
const MAKSIMAL_PERTANYAAN = 5;

function ambilAlamat(request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim()
    || request.headers.get("x-real-ip")
    || "unknown";
}

function bolehBertanya(alamat) {
  const sekarang = Date.now();
  const sebelumnya = batasPertanyaan.get(alamat);
  if (!sebelumnya || sekarang - sebelumnya.mulai > JENDELA_RATE_LIMIT) {
    batasPertanyaan.set(alamat, { mulai: sekarang, jumlah: 1 });
    return true;
  }
  if (sebelumnya.jumlah >= MAKSIMAL_PERTANYAAN) return false;
  sebelumnya.jumlah += 1;
  return true;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const produkId = Number(body?.produk_id);
  const pertanyaan = typeof body?.pertanyaan === "string" ? body.pertanyaan.trim() : "";
  if (!Number.isInteger(produkId) || !pertanyaan || pertanyaan.length > 500) {
    return NextResponse.json({ error: "Pertanyaan wajib diisi dan maksimal 500 karakter." }, { status: 400 });
  }
  if (!bolehBertanya(ambilAlamat(request))) {
    return NextResponse.json({ error: "Batas pertanyaan tercapai. Coba lagi dalam 15 menit." }, { status: 429 });
  }
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: "Asisten AI sedang tidak tersedia." }, { status: 503 });
  }

  const { data: produk, error } = await createServerSupabaseClient()
    .from("produk")
    .select("nama,harga,harga_diskon,kategori,status,deskripsi")
    .eq("id", produkId)
    .eq("aktif", true)
    .maybeSingle();
  if (error || !produk) return NextResponse.json({ error: "Produk tidak ditemukan." }, { status: 404 });

  const prompt = [
    "Anda adalah asisten katalog UMKM.",
    "Jawab hanya berdasarkan data produk berikut. Jika informasi tidak tersedia, katakan bahwa informasinya belum tersedia dan arahkan pembeli bertanya melalui WhatsApp.",
    "Jangan mengarang stok, ukuran, bahan, manfaat kesehatan, waktu pengiriman, atau kebijakan toko.",
    "Jawab dalam bahasa Indonesia, singkat dan ramah, maksimal 3 kalimat.",
    `Produk: ${produk.nama}`,
    `Kategori: ${produk.kategori || "Tidak ada"}`,
    `Harga: ${produk.harga_diskon || produk.harga}`,
    `Status stok: ${produk.status}`,
    `Deskripsi: ${produk.deskripsi || "Tidak ada deskripsi"}`,
    `Pertanyaan pembeli: ${pertanyaan}`,
  ].join("\n");

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        signal: AbortSignal.timeout(10000),
        cache: "no-store",
      },
    );
    if (!response.ok) return NextResponse.json({ error: "Asisten AI sedang tidak dapat menjawab." }, { status: 502 });
    const data = await response.json();
    const jawaban = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!jawaban) return NextResponse.json({ error: "Asisten AI tidak memberikan jawaban." }, { status: 502 });
    return NextResponse.json({ jawaban });
  } catch (error) {
    const pesan = error?.name === "TimeoutError" || error?.name === "AbortError"
      ? "Asisten AI terlalu lama merespons. Coba lagi."
      : "Asisten AI sedang tidak dapat menjawab.";
    return NextResponse.json({ error: pesan }, { status: 502 });
  }
}
