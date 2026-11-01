export function normalizeSupabaseUrl(supabaseUrl) {
  const projectUrl = new URL(supabaseUrl);

  if (projectUrl.pathname.replace(/\/$/, "") === "/rest/v1") {
    projectUrl.pathname = "";
  }

  return projectUrl.toString().replace(/\/$/, "");
}
