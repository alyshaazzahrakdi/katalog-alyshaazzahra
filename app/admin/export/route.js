import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/auth";

function csvNilai(nilai) {
  return `"${String(nilai ?? "").replaceAll('"', '""')}"`;
}

export async function GET() {
  const supabase = await createServerAuthClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return NextResponse.json({ error: "Sesi admin sudah berakhir." }, { status: 401 });
  }

  const { data, error } = await supabase.from("produk").select("*").order("created_at", { ascending: false });
  if (error) {
    return NextResponse.json({ error: "Produk gagal diekspor." }, { status: 500 });
  }

  const header = ["id", "nama", "harga", "harga_diskon", "kategori", "status", "badge", "aktif", "foto_url", "deskripsi", "created_at"];
  const rows = (data ?? []).map((produk) => header.map((kolom) => csvNilai(produk[kolom])).join(","));
  return new NextResponse([header.join(","), ...rows].join("\r\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="produk.csv"',
    },
  });
}
