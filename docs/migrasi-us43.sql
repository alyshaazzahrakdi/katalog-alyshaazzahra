-- US-43 Pengaturan toko. Jalankan setelah docs/schema.sql.
create table if not exists public.pengaturan_toko (
  id integer primary key check (id = 1),
  nama text not null check (char_length(nama) between 2 and 120),
  tagline text not null check (char_length(tagline) between 2 and 240),
  nomor_whatsapp text not null check (nomor_whatsapp ~ '^[1-9][0-9]{7,14}$'),
  alamat text not null check (char_length(alamat) between 2 and 240),
  jam_buka text not null check (char_length(jam_buka) between 2 and 120),
  updated_at timestamptz not null default now()
);

alter table public.pengaturan_toko enable row level security;

drop policy if exists "admin_baca_pengaturan_toko" on public.pengaturan_toko;
drop policy if exists "admin_ubah_pengaturan_toko" on public.pengaturan_toko;

create policy "admin_baca_pengaturan_toko" on public.pengaturan_toko
  for select to authenticated using (true);

create policy "admin_ubah_pengaturan_toko" on public.pengaturan_toko
  for all to authenticated using (true) with check (true);

insert into public.pengaturan_toko (id, nama, tagline, nomor_whatsapp, alamat, jam_buka)
values (1, 'Toko Beans Coffe', 'Beans Terbaik untuk temani harimu, siap dipesan lewat WhatsApp.', '6282119369226', 'Jl. merdeka', 'Setiap hari, 08.00–20.00')
on conflict (id) do nothing;
