-- Pulihkan foto utama dari foto_urls untuk produk yang foto_url-nya kosong.
update public.produk
set foto_url = foto_urls->>0
where (foto_url is null or foto_url = '')
  and jsonb_typeof(foto_urls) = 'array'
  and jsonb_array_length(foto_urls) > 0
  and foto_urls->>0 is not null
  and foto_urls->>0 <> '';

-- Beri foto bawaan berdasarkan kategori jika kedua sumber foto kosong.
update public.produk
set foto_url = case lower(trim(kategori))
  when 'minuman' then '/produk/kopi.svg'
  when 'camilan' then '/produk/keripik.svg'
  when 'bumbu' then '/produk/sambal.svg'
  when 'kue kering' then '/produk/nastar.svg'
  when 'kerajinan' then '/produk/tas.svg'
  when 'kain' then '/produk/batik.svg'
  else '/produk/kopi.svg'
end,
foto_urls = jsonb_build_array(case lower(trim(kategori))
  when 'minuman' then '/produk/kopi.svg'
  when 'camilan' then '/produk/keripik.svg'
  when 'bumbu' then '/produk/sambal.svg'
  when 'kue kering' then '/produk/nastar.svg'
  when 'kerajinan' then '/produk/tas.svg'
  when 'kain' then '/produk/batik.svg'
  else '/produk/kopi.svg'
end)
where (foto_url is null or foto_url = '')
  and (foto_urls is null or foto_urls = '[]'::jsonb);

-- Untuk link Drive, aplikasi mengubah URL tampilan ke endpoint thumbnail.
-- Pastikan file Drive sudah disetel "Anyone with the link: Viewer".
