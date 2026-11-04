import { NextResponse } from "next/server";
import { createServerAuthClient } from "@/lib/supabase/auth";
import { RECOVERY_COOKIE_NAME } from "@/lib/supabase/recovery";

export async function POST(request) {
  let body;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const accessToken = typeof body?.access_token === "string" ? body.access_token : "";
  const refreshToken = typeof body?.refresh_token === "string" ? body.refresh_token : "";

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Token recovery tidak lengkap." }, { status: 400 });
  }

  const supabase = await createServerAuthClient();
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (error) {
    return NextResponse.json({ error: "Sesi recovery tidak valid." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(RECOVERY_COOKIE_NAME, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
