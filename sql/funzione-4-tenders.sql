-- EdilMatch — FUNZIONALITÀ 4: appalti pubblici

create table if not exists public.tenders (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text,
  budget numeric,
  deadline timestamptz not null,
  location text,
  province text,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.tender_offers (
  id uuid primary key default gen_random_uuid(),
  tender_id uuid not null references public.tenders (id) on delete cascade,
  professional_id uuid not null references public.profiles (id) on delete cascade,
  offer_amount numeric not null,
  notes text,
  document_url text,
  created_at timestamptz not null default now(),
  unique (tender_id, professional_id)
);

create index if not exists idx_tenders_status on public.tenders (status);
create index if not exists idx_tender_offers_tender on public.tender_offers (tender_id);

alter table public.tenders enable row level security;
alter table public.tender_offers enable row level security;

drop policy if exists "tenders_select_all" on public.tenders;
create policy "tenders_select_all" on public.tenders for select using (true);

drop policy if exists "tenders_insert_admin" on public.tenders;
create policy "tenders_insert_admin" on public.tenders for insert with check (auth.uid() = created_by);

drop policy if exists "tender_offers_select_own" on public.tender_offers;
create policy "tender_offers_select_own" on public.tender_offers for select
  using (auth.uid() = professional_id or exists (select 1 from public.tenders t where t.id = tender_id));

drop policy if exists "tender_offers_insert_pro" on public.tender_offers;
create policy "tender_offers_insert_pro" on public.tender_offers for insert
  with check (
    auth.uid() = professional_id
    and exists (
      select 1 from public.professional_profiles pp
      where pp.user_id = professional_id and pp.subscription_plan = 'pro'
    )
  );

-- Esempi (created_by null = pubblicati da sistema)
insert into public.tenders (title, description, category, budget, deadline, location, province, status, created_by)
values
  ('Ristrutturazione scuola elementare', 'Lavori di adeguamento sismico e rifacimento infissi per istituto di 12 aule.', 'Ristrutturazione', 420000, now() + interval '45 days', 'Matera', 'MT', 'open', null),
  ('Impianto elettrico polo logistico', 'Realizzazione cabina MT/BT e quadri per centro distribuzione 8.000 mq.', 'Elettricista', 185000, now() + interval '30 days', 'Taranto', 'TA', 'open', null),
  ('Rifacimento reti idrauliche condominio', 'Sostituzione colonne montanti e centrale termica in stabile di 24 appartamenti.', 'Idraulica', 95000, now() + interval '21 days', 'Bari', 'BA', 'open', null),
  ('Cappotto termico e facciata', 'Intervento su edificio pubblico 5 piani, zona UNESCO.', 'Imbiancatura', 310000, now() + interval '60 days', 'Lecce', 'LE', 'open', null),
  ('Fotovoltaico su capannone industriale', 'Impianto da 200 kWp con accumulo e connessione in media tensione.', 'Fotovoltaico', 275000, now() + interval '40 days', 'Foggia', 'FG', 'open', null)
on conflict do nothing;
