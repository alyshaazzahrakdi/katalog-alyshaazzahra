-- Tambahkan jumlah stok untuk produk yang sudah ada.
alter table public.produk add column if not exists stok integer not null default 0;
alter table public.produk drop constraint if exists produk_stok_check;
alter table public.produk add constraint produk_stok_check check (stok >= 0);

-- Produk yang sebelumnya tersedia tetap dianggap tersedia; sesuaikan jumlahnya dari admin.
update public.produk
set stok = 1
where status = 'tersedia' and stok = 0;
