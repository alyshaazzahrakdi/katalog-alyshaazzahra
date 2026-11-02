-- US-44 sampai US-46. Jalankan setelah docs/schema.sql dan migrasi fitur lain.
create table if not exists public.log_aktivitas_admin (
  id bigint generated always as identity primary key,
  admin_id uuid,
  admin_email text not null,
  aksi text not null check (char_length(aksi) between 2 and 80),
  target text,
  detail text,
  created_at timestamptz not null default now()
);

alter table public.log_aktivitas_admin enable row level security;
drop policy if exists "admin_baca_log_aktivitas" on public.log_aktivitas_admin;
create policy "admin_baca_log_aktivitas" on public.log_aktivitas_admin
  for select to authenticated using (true);
