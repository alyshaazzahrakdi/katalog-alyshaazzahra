-- Jalankan sekali di Supabase SQL Editor untuk database yang sudah ada.
alter table public.produk add column if not exists foto_urls jsonb not null default '[]'::jsonb;
alter table public.produk add column if not exists status text not null default 'tersedia';
alter table public.produk add column if not exists harga_diskon integer;
alter table public.produk add column if not exists badge text;
update public.produk set foto_urls = jsonb_build_array(foto_url) where foto_url is not null and foto_urls = '[]'::jsonb;
alter table public.produk drop constraint if exists produk_status_check;
alter table public.produk add constraint produk_status_check check (status in ('tersedia', 'habis'));
