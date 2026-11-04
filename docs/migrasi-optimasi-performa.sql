-- Indeks untuk query katalog publik dan pengurutan produk.
create index if not exists produk_katalog_aktif_idx
  on public.produk (aktif, urutan, created_at desc);

create index if not exists produk_kategori_aktif_idx
  on public.produk (kategori, aktif, urutan, created_at desc);

create index if not exists produk_nama_lower_idx
  on public.produk (lower(nama));
