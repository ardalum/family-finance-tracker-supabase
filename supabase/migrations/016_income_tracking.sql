-- Phase 23: Income tracking MVP tables for manual income source + entry management.

create table if not exists public.income_sources (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  source_type text not null default 'paycheck'
    check (source_type in ('paycheck', 'freelance', 'benefit', 'interest', 'bonus', 'other')),
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  expected_amount numeric not null default 0,
  frequency text not null default 'monthly'
    check (frequency in ('weekly', 'biweekly', 'semimonthly', 'monthly', 'irregular')),
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint income_sources_name_not_blank check (length(trim(name)) > 0)
);

create table if not exists public.income_entries (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  income_source_id uuid references public.income_sources(id) on delete set null,
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  entry_date date not null,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  amount numeric not null default 0,
  entry_type text not null default 'paycheck'
    check (entry_type in ('paycheck', 'bonus', 'freelance', 'benefit', 'interest', 'adjustment', 'other')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists income_sources_household_id_idx
  on public.income_sources (household_id);

create index if not exists income_sources_household_active_idx
  on public.income_sources (household_id, is_active);

create index if not exists income_entries_household_month_idx
  on public.income_entries (household_id, month_key);

create index if not exists income_entries_source_idx
  on public.income_entries (income_source_id);

create index if not exists income_entries_owner_profile_idx
  on public.income_entries (owner_profile_id);

drop trigger if exists set_income_sources_updated_at on public.income_sources;
create trigger set_income_sources_updated_at
  before update on public.income_sources
  for each row execute function public.set_updated_at();

drop trigger if exists set_income_entries_updated_at on public.income_entries;
create trigger set_income_entries_updated_at
  before update on public.income_entries
  for each row execute function public.set_updated_at();

alter table public.income_sources enable row level security;
alter table public.income_entries enable row level security;

drop policy if exists "Income sources are visible to household members" on public.income_sources;
create policy "Income sources are visible to household members"
  on public.income_sources for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Income sources are editable by household members" on public.income_sources;
create policy "Income sources are editable by household members"
  on public.income_sources for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists "Income entries are visible to household members" on public.income_entries;
create policy "Income entries are visible to household members"
  on public.income_entries for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Income entries are editable by household members" on public.income_entries;
create policy "Income entries are editable by household members"
  on public.income_entries for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

select pg_notify('pgrst', 'reload schema');
