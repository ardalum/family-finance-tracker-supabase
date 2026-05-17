-- Phase 33: Liability/debt snapshots manual-tracking MVP.

create table if not exists public.liability_accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  liability_type text not null default 'other'
    check (
      liability_type in (
        'credit_card',
        'auto_loan',
        'student_loan',
        'personal_loan',
        'mortgage',
        'medical_debt',
        'buy_now_pay_later',
        'family_loan',
        'other'
      )
    ),
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  linked_credit_card_id uuid references public.credit_cards(id) on delete set null,
  institution_name text not null default '',
  interest_rate numeric,
  minimum_payment numeric not null default 0,
  due_day integer check (due_day is null or due_day between 1 and 31),
  is_active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint liability_accounts_name_not_blank check (length(trim(name)) > 0)
);

create table if not exists public.liability_balance_snapshots (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  liability_account_id uuid not null references public.liability_accounts(id) on delete cascade,
  owner_profile_id uuid references public.household_profiles(id) on delete set null,
  snapshot_date date not null,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  balance_amount numeric not null default 0,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists liability_accounts_household_id_idx
  on public.liability_accounts (household_id);

create index if not exists liability_accounts_household_active_idx
  on public.liability_accounts (household_id, is_active);

create index if not exists liability_accounts_linked_credit_card_idx
  on public.liability_accounts (linked_credit_card_id);

create index if not exists liability_balance_snapshots_household_month_idx
  on public.liability_balance_snapshots (household_id, month_key);

create index if not exists liability_balance_snapshots_account_idx
  on public.liability_balance_snapshots (liability_account_id);

create index if not exists liability_balance_snapshots_owner_profile_idx
  on public.liability_balance_snapshots (owner_profile_id);

drop trigger if exists set_liability_accounts_updated_at on public.liability_accounts;
create trigger set_liability_accounts_updated_at
  before update on public.liability_accounts
  for each row execute function public.set_updated_at();

drop trigger if exists set_liability_balance_snapshots_updated_at on public.liability_balance_snapshots;
create trigger set_liability_balance_snapshots_updated_at
  before update on public.liability_balance_snapshots
  for each row execute function public.set_updated_at();

alter table public.liability_accounts enable row level security;
alter table public.liability_balance_snapshots enable row level security;

drop policy if exists "Liability accounts are visible to household members" on public.liability_accounts;
create policy "Liability accounts are visible to household members"
  on public.liability_accounts for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Liability accounts are editable by household members" on public.liability_accounts;
create policy "Liability accounts are editable by household members"
  on public.liability_accounts for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists "Liability balance snapshots are visible to household members" on public.liability_balance_snapshots;
create policy "Liability balance snapshots are visible to household members"
  on public.liability_balance_snapshots for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Liability balance snapshots are editable by household members" on public.liability_balance_snapshots;
create policy "Liability balance snapshots are editable by household members"
  on public.liability_balance_snapshots for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

select pg_notify('pgrst', 'reload schema');
