-- EdilMatch — FUNZIONALITÀ 2: coordinate geografiche sulle richieste
alter table public.requests
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create index if not exists idx_requests_lat_lng on public.requests (lat, lng)
  where lat is not null and lng is not null and status = 'open';
