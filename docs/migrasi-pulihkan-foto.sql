-- Pulihkan foto utama dari foto_urls untuk produk yang foto_url-nya kosong.
update public.produk
set foto_url = foto_urls->>0
where (foto_url is null or foto_url = '')
  and jsonb_typeof(foto_urls) = 'array'
  and jsonb_array_length(foto_urls) > 0
  and foto_urls->>0 is not null
  and foto_urls->>0 <> '';
