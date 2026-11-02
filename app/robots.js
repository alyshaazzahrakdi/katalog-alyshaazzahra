export default function robots() {
  const base = process.env.SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  return { rules: { userAgent: "*", allow: "/" , disallow: "/admin/" }, sitemap: `${base}/sitemap.xml` };
}
