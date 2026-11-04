-- Jalankan sekali di Supabase SQL Editor untuk database yang sudah ada.
alter table public.produk add column if not exists foto_urls jsonb not null default '[]'::jsonb;
alter table public.produk add column if not exists status text not null default 'tersedia';
alter table public.produk add column if not exists harga_diskon integer;
alter table public.produk add column if not exists badge text;
alter table public.produk add column if not exists aktif boolean not null default true;
update public.produk set foto_urls = jsonb_build_array(foto_url) where foto_url is not null and foto_urls = '[]'::jsonb;
alter table public.produk drop constraint if exists produk_status_check;
alter table public.produk add constraint produk_status_check check (status in ('tersedia', 'habis'));

create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null unique,
  created_at timestamptz not null default now()
);
alter table public.kategori enable row level security;
drop policy if exists "admin_kelola_kategori" on public.kategori;
create policy "admin_kelola_kategori" on public.kategori for all to authenticated using (true) with check (true);

insert into public.kategori (nama)
select distinct trim(kategori)
from public.produk
where kategori is not null and trim(kategori) <> ''
on conflict (nama) do nothing;
