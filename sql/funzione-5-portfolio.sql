-- EdilMatch — FUNZIONALITÀ 5: portfolio lavori

create table if not exists public.portfolio_projects (
  id uuid primary key default gen_random_uuid(),
  professional_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  description text,
  category text,
  before_images text[] not null default '{}',
  after_images text[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_portfolio_prof on public.portfolio_projects (professional_id);

alter table public.portfolio_projects enable row level security;

drop policy if exists "portfolio_select_public" on public.portfolio_projects;
create policy "portfolio_select_public" on public.portfolio_projects for select using (true);

drop policy if exists "portfolio_write_owner" on public.portfolio_projects;
create policy "portfolio_write_owner" on public.portfolio_projects for insert
  with check (auth.uid() = professional_id);

drop policy if exists "portfolio_update_owner" on public.portfolio_projects;
create policy "portfolio_update_owner" on public.portfolio_projects for update using (auth.uid() = professional_id);

drop policy if exists "portfolio_delete_owner" on public.portfolio_projects;
create policy "portfolio_delete_owner" on public.portfolio_projects for delete using (auth.uid() = professional_id);
