import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { normalizeSupabaseUrl } from "@/lib/supabase/url";
import { RECOVERY_COOKIE_NAME } from "@/lib/supabase/recovery";

export async function proxy(request) {
  let response = NextResponse.next({ request });
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabasePublishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("Konfigurasi Supabase Auth belum lengkap. Periksa SUPABASE_URL dan SUPABASE_PUBLISHABLE_KEY.");
  }

  const supabase = createServerClient(normalizeSupabaseUrl(supabaseUrl), supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: userData } = await supabase.auth.getUser();
  const isPublicAuthPage = [
    "/admin/login",
    "/admin/login/lupa-password",
  ].includes(request.nextUrl.pathname);

  if (request.nextUrl.pathname === "/admin/password/reset"
    && request.cookies.get(RECOVERY_COOKIE_NAME)?.value !== "1") {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "error=Link%20reset%20tidak%20valid%20atau%20sudah%20kedaluwarsa.";
    return NextResponse.redirect(loginUrl);
  }

  if (!userData.user && !isPublicAuthPage) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/admin/login";
    loginUrl.search = "";
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
