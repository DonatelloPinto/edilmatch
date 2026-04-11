-- EdilMatch — FUNZIONALITÀ 3: disponibilità professionista
-- time_slots: es. ARRAY['morning','afternoon','evening'] oppure testo libero coerente con l'app

create table if not exists public.professional_availability (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  time_slots text[] not null default '{}',
  created_at timestamptz not null default now(),
  constraint professional_availability_unique_day unique (professional_id, date)
);

create index if not exists idx_prof_avail_prof_date on public.professional_availability (professional_id, date);

alter table public.professional_availability enable row level security;

drop policy if exists "availability_select_public" on public.professional_availability;
create policy "availability_select_public"
  on public.professional_availability for select
  using (true);

drop policy if exists "availability_write_owner" on public.professional_availability;
create policy "availability_write_owner"
  on public.professional_availability for insert
  with check (auth.uid() = professional_id);

drop policy if exists "availability_update_owner" on public.professional_availability;
create policy "availability_update_owner"
  on public.professional_availability for update
  using (auth.uid() = professional_id);

drop policy if exists "availability_delete_owner" on public.professional_availability;
create policy "availability_delete_owner"
  on public.professional_availability for delete
  using (auth.uid() = professional_id);
