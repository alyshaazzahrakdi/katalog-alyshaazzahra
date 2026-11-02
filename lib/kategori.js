export function slugKategori(kategori) {
  return String(kategori ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function kategoriDariSlug(slug, daftarKategori) {
  return daftarKategori.find((kategori) => slugKategori(kategori) === slug) || null;
}
