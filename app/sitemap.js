import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const base = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const { data = [] } = await createServerSupabaseClient().from("produk").select("id, created_at");
  return [{ url: base, lastModified: new Date() }, { url: `${base}/tentang`, lastModified: new Date() }, { url: `${base}/favorit`, lastModified: new Date() }, ...data.map((item) => ({ url: `${base}/produk/${item.id}`, lastModified: item.created_at ? new Date(item.created_at) : new Date() }))];
}
