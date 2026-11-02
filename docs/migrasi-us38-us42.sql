-- US-38 sampai US-42. Jalankan setelah docs/schema.sql.
create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null check (char_length(nama) between 2 and 80),
  rating integer not null check (rating between 1 and 5),
  komentar text not null check (char_length(komentar) between 3 and 1000),
  tampil boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.ulasan enable row level security;
drop policy if exists "admin_kelola_ulasan" on public.ulasan;
create policy "admin_kelola_ulasan" on public.ulasan for all to authenticated using (true) with check (true);

create table if not exists public.klik_whatsapp (
  id bigint generated always as identity primary key,
  produk_id bigint references public.produk(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.klik_whatsapp enable row level security;
drop policy if exists "admin_baca_klik" on public.klik_whatsapp;
create policy "admin_baca_klik" on public.klik_whatsapp for select to authenticated using (true);

create table if not exists public.banner_promo (
  id bigint generated always as identity primary key,
  judul text not null,
  teks text,
  gambar_url text,
  tautan text,
  aktif boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.banner_promo enable row level security;
drop policy if exists "admin_kelola_banner" on public.banner_promo;
create policy "admin_kelola_banner" on public.banner_promo for all to authenticated using (true) with check (true);
