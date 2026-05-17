-- Phase 25: Savings goals and contributions manual-tracking MVP.

create table if not exists public.savings_goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  goal_type text not null default 'general'
    check (goal_type in ('emergency_fund', 'sinking_fund', 'vacation', 'home', 'car', 'education', 'kids', 'general', 'other')),
  target_amount numeric not null default 0,
  starting_amount numeric not null default 0,
  target_date date,
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint savings_goals_name_not_blank check (length(trim(name)) > 0)
);

create table if not exists public.savings_contributions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  savings_goal_id uuid references public.savings_goals(id) on delete set null,
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  contribution_date date not null,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  amount numeric not null default 0,
  contribution_type text not null default 'transfer'
    check (contribution_type in ('transfer', 'adjustment', 'interest', 'other')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists savings_goals_household_id_idx
  on public.savings_goals (household_id);

create index if not exists savings_goals_household_active_idx
  on public.savings_goals (household_id, is_active);

create index if not exists savings_contributions_household_month_idx
  on public.savings_contributions (household_id, month_key);

create index if not exists savings_contributions_goal_idx
  on public.savings_contributions (savings_goal_id);

create index if not exists savings_contributions_owner_profile_idx
  on public.savings_contributions (owner_profile_id);

drop trigger if exists set_savings_goals_updated_at on public.savings_goals;
create trigger set_savings_goals_updated_at
  before update on public.savings_goals
  for each row execute function public.set_updated_at();

drop trigger if exists set_savings_contributions_updated_at on public.savings_contributions;
create trigger set_savings_contributions_updated_at
  before update on public.savings_contributions
  for each row execute function public.set_updated_at();

alter table public.savings_goals enable row level security;
alter table public.savings_contributions enable row level security;

drop policy if exists "Savings goals are visible to household members" on public.savings_goals;
create policy "Savings goals are visible to household members"
  on public.savings_goals for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Savings goals are editable by household members" on public.savings_goals;
create policy "Savings goals are editable by household members"
  on public.savings_goals for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists "Savings contributions are visible to household members" on public.savings_contributions;
create policy "Savings contributions are visible to household members"
  on public.savings_contributions for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Savings contributions are editable by household members" on public.savings_contributions;
create policy "Savings contributions are editable by household members"
  on public.savings_contributions for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

select pg_notify('pgrst', 'reload schema');
