import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const produkId = Number(body?.produk_id);
    if (Number.isInteger(produkId)) await createServerSupabaseClient().from("klik_whatsapp").insert({ produk_id: produkId });
  } catch {}
  return NextResponse.json({ ok: true });
}
