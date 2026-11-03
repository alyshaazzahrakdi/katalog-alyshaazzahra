const FOTO_BAWAAN_PER_KATEGORI = {
  minuman: "/produk/kopi.svg",
  camilan: "/produk/keripik.svg",
  bumbu: "/produk/sambal.svg",
  "kue kering": "/produk/nastar.svg",
  kerajinan: "/produk/tas.svg",
  kain: "/produk/batik.svg",
};

function fotoBawaan(produk) {
  const kategori = String(produk?.kategori ?? "").trim().toLowerCase();
  return FOTO_BAWAAN_PER_KATEGORI[kategori] || "/produk/kopi.svg";
}

export function ambilIdGoogleDrive(nilai) {
  const url = String(nilai ?? "").trim();
  if (!url) return "";

  try {
    const parsedUrl = new URL(url);
    if (!["drive.google.com", "docs.google.com", "lh3.googleusercontent.com", "drive.usercontent.google.com"].includes(parsedUrl.hostname)) return "";
    return parsedUrl.pathname.match(/\/file\/d\/([^/]+)/)?.[1]
      || parsedUrl.pathname.match(/\/d\/([^/]+)/)?.[1]
      || parsedUrl.searchParams.get("id")
      || "";
  } catch {
    return "";
  }
}

export function ambilFotoUtama(produk) {
  if (produk?.foto_url) return produk.foto_url;

  const daftarFoto = Array.isArray(produk?.foto_urls)
    ? produk.foto_urls
    : typeof produk?.foto_urls === "string"
      ? (() => {
        try {
          const hasil = JSON.parse(produk.foto_urls);
          return Array.isArray(hasil) ? hasil : [];
        } catch {
          return [];
        }
      })()
      : [];

  return daftarFoto.find((foto) => typeof foto === "string" && foto.trim()) || fotoBawaan(produk);
}

export function daftarFotoProduk(produk) {
  const sumber = Array.isArray(produk?.foto_urls)
    ? produk.foto_urls
    : typeof produk?.foto_urls === "string"
      ? (() => {
        try {
          const hasil = JSON.parse(produk.foto_urls);
          return Array.isArray(hasil) ? hasil : [];
        } catch {
          return [];
        }
      })()
      : [];

  const foto = [...new Set([produk?.foto_url, ...sumber].filter((nilai) => typeof nilai === "string" && nilai.trim()))];
  return [...foto, fotoBawaan(produk)];
}

export function urlFotoTampil(nilai) {
  const url = String(nilai ?? "").trim();

  if (!url) {
    return "";
  }

  try {
    const parsedUrl = new URL(url);
    const fileId = ambilIdGoogleDrive(url);
    if (fileId) {
      return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1200`;
    }
  } catch {
    return url;
  }

  return url;
}
