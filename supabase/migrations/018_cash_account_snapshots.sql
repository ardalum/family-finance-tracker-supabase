-- Phase 30: Cash account snapshots manual-tracking MVP.

create table if not exists public.cash_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  account_type text not null default 'checking'
    check (account_type in ('checking', 'savings', 'cash', 'money_market', 'emergency_fund', 'other')),
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  institution_name text not null default '',
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cash_accounts_name_not_blank check (length(trim(name)) > 0)
);

create table if not exists public.account_balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  cash_account_id uuid not null references public.cash_accounts(id) on delete cascade,
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  snapshot_date date not null,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  balance_amount numeric not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists cash_accounts_household_id_idx
  on public.cash_accounts (household_id);

create index if not exists cash_accounts_household_active_idx
  on public.cash_accounts (household_id, is_active);

create index if not exists account_balance_snapshots_household_month_idx
  on public.account_balance_snapshots (household_id, month_key);

create index if not exists account_balance_snapshots_account_idx
  on public.account_balance_snapshots (cash_account_id);

create index if not exists account_balance_snapshots_owner_profile_idx
  on public.account_balance_snapshots (owner_profile_id);

drop trigger if exists set_cash_accounts_updated_at on public.cash_accounts;
create trigger set_cash_accounts_updated_at
  before update on public.cash_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists set_account_balance_snapshots_updated_at on public.account_balance_snapshots;
create trigger set_account_balance_snapshots_updated_at
  before update on public.account_balance_snapshots
  for each row execute function public.set_updated_at();

alter table public.cash_accounts enable row level security;
alter table public.account_balance_snapshots enable row level security;

drop policy if exists "Cash accounts are visible to household members" on public.cash_accounts;
create policy "Cash accounts are visible to household members"
  on public.cash_accounts for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Cash accounts are editable by household members" on public.cash_accounts;
create policy "Cash accounts are editable by household members"
  on public.cash_accounts for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists "Account balance snapshots are visible to household members" on public.account_balance_snapshots;
create policy "Account balance snapshots are visible to household members"
  on public.account_balance_snapshots for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Account balance snapshots are editable by household members" on public.account_balance_snapshots;
create policy "Account balance snapshots are editable by household members"
  on public.account_balance_snapshots for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

select pg_notify('pgrst', 'reload schema');
