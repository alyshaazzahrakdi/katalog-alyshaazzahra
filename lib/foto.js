export function urlFotoTampil(nilai) {
  const url = String(nilai ?? "").trim();

  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname === "drive.google.com") {
      const fileId = parsedUrl.pathname.match(/^\/file\/d\/([^/]+)/)?.[1] || parsedUrl.searchParams.get("id");
      if (fileId) {
        return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`;
      }
    }
  } catch {
    return url;
  }

  return url;
}
