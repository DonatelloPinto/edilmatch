-- EdilMatch — FUNZIONALITÀ 6: referral professionisti

alter table public.professional_profiles
  add column if not exists referral_code text;

create unique index if not exists professional_profiles_referral_code_key
  on public.professional_profiles (referral_code)
  where referral_code is not null;

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id uuid not null references public.profiles (id) on delete cascade,
  referred_email text not null,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  reward_credited boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_referrals_referrer on public.referrals (referrer_id);
create index if not exists idx_referrals_email on public.referrals (referred_email);

alter table public.referrals enable row level security;

drop policy if exists "referrals_select_referrer" on public.referrals;
create policy "referrals_select_referrer" on public.referrals for select using (auth.uid() = referrer_id);

drop policy if exists "referrals_insert_system" on public.referrals;
create policy "referrals_insert_signup" on public.referrals for insert with check (true);
