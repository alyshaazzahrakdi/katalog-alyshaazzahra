-- US-47 sampai US-49. Jalankan setelah migrasi produk sebelumnya.
alter table public.produk add column if not exists urutan integer not null default 0;

create table if not exists public.varian_produk (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null check (char_length(nama) between 1 and 80),
  harga integer not null check (harga >= 0),
  created_at timestamptz not null default now()
);

alter table public.varian_produk enable row level security;
drop policy if exists "admin_baca_varian_produk" on public.varian_produk;
drop policy if exists "admin_kelola_varian_produk" on public.varian_produk;
create policy "admin_baca_varian_produk" on public.varian_produk
  for select to authenticated using (true);
create policy "admin_kelola_varian_produk" on public.varian_produk
  for all to authenticated using (true) with check (true);

create index if not exists produk_urutan_idx on public.produk (urutan, created_at desc);
create index if not exists varian_produk_produk_id_idx on public.varian_produk (produk_id);
