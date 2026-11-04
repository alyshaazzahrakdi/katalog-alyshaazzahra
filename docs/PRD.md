# PRD: Katalog UMKM + Order WhatsApp

## Tujuan

Menyediakan katalog produk online untuk satu UMKM yang dapat dibagikan melalui satu
tautan, dengan pemesanan langsung melalui WhatsApp. Aplikasi juga menyediakan area
admin untuk mengelola katalog, toko, akun admin, dan aktivitas operasional.

## Pengguna

| Pengguna | Kebutuhan |
| --- | --- |
| Pengunjung atau calon pembeli | Melihat, mencari, membandingkan, menyimpan, dan memesan produk melalui WhatsApp |
| Admin atau pemilik toko | Mengelola produk, kategori produk, toko, ulasan, banner, akun admin, dan data operasional |

## Status implementasi

**50 dari 50 user story selesai.**

### Fitur utama

| Fitur | User story | Status |
| --- | --- | --- |
| Katalog produk dari database | US-01 | Selesai |
| Halaman detail produk | US-02 | Selesai |
| Pesan via WhatsApp dengan pesan otomatis | US-03 | Selesai |
| Login admin | US-04 | Selesai |
| Ganti password admin | US-05 | Selesai |
| Halaman admin hanya untuk admin yang login | US-06 | Selesai |

### User story bonus

| User story | Poin | Status |
| --- | ---: | --- |
| US-07 List produk | 10 | Selesai |
| US-08 Tambah produk | 10 | Selesai |
| US-09 Ubah produk | 10 | Selesai |
| US-10 Hapus produk | 10 | Selesai |
| US-11 Filter kategori atau pencarian | 10 | Selesai |
| US-12 Pilih jumlah atau varian | 10 | Selesai |
| US-13 PWA | 10 | Selesai |
| US-14 Deskripsi produk dibuat AI | 10 | Selesai |
| US-15 Urutkan produk | 5 | Selesai |
| US-16 Paginasi atau muat lebih banyak | 10 | Selesai |
| US-17 Produk terkait di halaman detail | 5 | Selesai |
| US-18 Galeri beberapa foto produk | 10 | Selesai |
| US-19 Status stok | 5 | Selesai |
| US-20 Harga coret dan badge | 5 | Selesai |
| US-21 Keranjang, pesan semua via WhatsApp | 15 | Selesai |
| US-22 Halaman Tentang dan kontak toko | 5 | Selesai |
| US-23 Bagikan atau salin link produk | 5 | Selesai |
| US-24 Favorit tersimpan di browser | 10 | Selesai |
| US-25 Mode gelap | 10 | Selesai |
| US-26 Metadata SEO dan Open Graph | 5 | Selesai |
| US-27 sitemap.xml dan robots.txt | 5 | Selesai |
| US-28 Halaman 404 dan loading kustom | 5 | Selesai |
| US-29 Upload foto ke Supabase Storage | 15 | Selesai |
| US-30 Dashboard ringkasan admin | 10 | Selesai |
| US-31 Kelola kategori | 15 | Selesai |
| US-32 Aktif atau nonaktifkan produk | 10 | Selesai |
| US-33 Cari dan paginasi di list admin | 10 | Selesai |
| US-34 Validasi form admin di server | 10 | Selesai |
| US-35 Ekspor produk ke CSV | 10 | Selesai |
| US-36 Terakhir dilihat | 5 | Selesai |
| US-37 Bandingkan 2 produk | 15 | Selesai |
| US-38 Ulasan dan rating | 15 | Selesai |
| US-39 Moderasi ulasan di admin | 10 | Selesai |
| US-40 Catat klik pesan WhatsApp | 10 | Selesai |
| US-41 Produk terlaris di dashboard | 10 | Selesai |
| US-42 Banner promo di beranda | 10 | Selesai |
| US-43 Pengaturan toko dari admin | 15 | Selesai |
| US-44 Kelola akun admin | 15 | Selesai |
| US-45 Log aktivitas admin | 10 | Selesai |
| US-46 Impor produk dari CSV | 15 | Selesai |
| US-47 Atur urutan tampil produk | 10 | Selesai |
| US-48 Varian harga per ukuran | 15 | Selesai |
| US-49 Halaman per kategori | 10 | Selesai |
| US-50 Asisten AI tanya jawab produk | 15 | Selesai |

## Ruang lingkup yang sudah tersedia

- Katalog publik dengan pencarian, filter kategori, pengurutan, paginasi, banner
  promo, produk terkait, status stok, harga diskon, badge, dan halaman kategori.
- Detail produk dengan galeri foto, varian harga, ulasan dan rating, favorit,
  produk terakhir dilihat, perbandingan produk, berbagi link, keranjang, dan
  asisten AI.
- Pemesanan satu produk atau seluruh isi keranjang melalui WhatsApp, termasuk
  pencatatan klik WhatsApp.
- PWA yang dapat dipasang ke layar utama perangkat melalui web app manifest.
- Admin dengan login, proteksi rute, CRUD produk, upload foto, impor atau ekspor
  CSV, pengaturan toko, banner, status produk, urutan tampil, dashboard, ulasan,
  akun admin, dan log aktivitas.

## Di luar ruang lingkup

- Keranjang belanja dengan pembayaran online.
- Pendaftaran akun pengunjung.
- Pendaftaran akun admin dari aplikasi; akun admin dibuat dan dikelola melalui
  fitur admin atau Supabase Auth.

## Kriteria keberhasilan

- Aplikasi dapat dibuka melalui tautan deployment Vercel.
- Pengunjung dapat menemukan produk dan memesan melalui WhatsApp dengan alur yang
  singkat.
- Produk nonaktif tidak tampil di katalog publik.
- Data produk dan data admin tidak dapat diakses atau diubah langsung dari luar
  aplikasi tanpa otorisasi.
- Semua aksi perubahan data admin divalidasi dan dilindungi pemeriksaan login di
  server.
- Foto produk dapat diunggah ke Supabase Storage dengan batas tipe dan ukuran file.

## Batasan teknis

- Stack: Next.js 16 dengan App Router, JavaScript, Tailwind CSS 4, Supabase, dan
  Vercel.
- Akses Supabase hanya dari Server Component, Server Action, atau Route Handler;
  kunci Supabase tidak dikirim ke browser.
- Environment variable yang digunakan adalah `SUPABASE_URL`,
  `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, dan konfigurasi server
  terkait lainnya tanpa awalan `NEXT_PUBLIC_`.
- Row Level Security tetap aktif di Supabase.
- Foto produk disimpan di Supabase Storage; URL foto disimpan pada data produk.
- Data identitas toko berasal dari pengaturan toko di database dengan data pada
  `lib/toko.js` sebagai cadangan.
