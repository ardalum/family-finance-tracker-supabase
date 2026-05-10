-- Phase 2: initial database schema for the finance tracker.
-- Run before 002_rls_policies.sql and 003_auth_profile_and_household.sql.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.validate_household_references()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'monthly_card_balances' then
    if not exists (
      select 1 from public.credit_cards cc
      where cc.id = new.credit_card_id
        and cc.household_id = new.household_id
    ) then
      raise exception 'monthly_card_balances.credit_card_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'recurring_payments' then
    if new.credit_card_id is not null and not exists (
      select 1 from public.credit_cards cc
      where cc.id = new.credit_card_id
        and cc.household_id = new.household_id
    ) then
      raise exception 'recurring_payments.credit_card_id must belong to the same household.';
    end if;

    if new.category_id is not null and not exists (
      select 1 from public.budget_categories bc
      where bc.id = new.category_id
        and bc.household_id = new.household_id
    ) then
      raise exception 'recurring_payments.category_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'transactions' then
    if new.credit_card_id is not null and not exists (
      select 1 from public.credit_cards cc
      where cc.id = new.credit_card_id
        and cc.household_id = new.household_id
    ) then
      raise exception 'transactions.credit_card_id must belong to the same household.';
    end if;

    if new.recurring_payment_id is not null and not exists (
      select 1 from public.recurring_payments rp
      where rp.id = new.recurring_payment_id
        and rp.household_id = new.household_id
    ) then
      raise exception 'transactions.recurring_payment_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'transaction_splits' then
    if not exists (
      select 1 from public.transactions t
      where t.id = new.transaction_id
        and t.household_id = new.household_id
    ) then
      raise exception 'transaction_splits.transaction_id must belong to the same household.';
    end if;

    if new.category_id is not null and not exists (
      select 1 from public.budget_categories bc
      where bc.id = new.category_id
        and bc.household_id = new.household_id
    ) then
      raise exception 'transaction_splits.category_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'recurring_payment_instances' then
    if not exists (
      select 1 from public.recurring_payments rp
      where rp.id = new.recurring_payment_id
        and rp.household_id = new.household_id
    ) then
      raise exception 'recurring_payment_instances.recurring_payment_id must belong to the same household.';
    end if;

    if new.transaction_id is not null and not exists (
      select 1 from public.transactions t
      where t.id = new.transaction_id
        and t.household_id = new.household_id
    ) then
      raise exception 'recurring_payment_instances.transaction_id must belong to the same household.';
    end if;
  end if;

  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  status text not null default 'active' check (status in ('active', 'invited', 'removed')),
  invited_email text,
  joined_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint household_members_user_or_invite check (user_id is not null or invited_email is not null)
);

create unique index if not exists household_members_household_user_unique
  on public.household_members (household_id, user_id)
  where user_id is not null;

create index if not exists household_members_user_id_idx
  on public.household_members (user_id);

create index if not exists household_members_household_id_idx
  on public.household_members (household_id);

create table if not exists public.credit_cards (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  url text not null default '',
  network text not null default '',
  owner_name text not null default '',
  last_four text not null default '' check (last_four = '' or last_four ~ '^[0-9]{4}$'),
  credit_limit numeric(12, 2) not null default 0 check (credit_limit >= 0),
  statement_closing_day integer not null default 1 check (statement_closing_day between 1 and 31),
  due_day integer not null default 1 check (due_day between 1 and 31),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists credit_cards_household_id_idx
  on public.credit_cards (household_id);

create table if not exists public.monthly_card_balances (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards(id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  balance numeric(12, 2) not null default 0 check (balance >= 0),
  paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (credit_card_id, month_key)
);

create index if not exists monthly_card_balances_household_month_idx
  on public.monthly_card_balances (household_id, month_key);

create table if not exists public.budget_categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  name text not null,
  monthly_amount numeric(12, 2) not null default 0 check (monthly_amount >= 0),
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists budget_categories_household_month_idx
  on public.budget_categories (household_id, month_key);

create table if not exists public.recurring_payments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  category_id uuid references public.budget_categories(id) on delete set null,
  bill_type text not null check (bill_type in ('fixed', 'variable')),
  estimated_amount numeric(12, 2) not null default 0 check (estimated_amount >= 0),
  due_day integer not null default 1 check (due_day between 1 and 31),
  payment_method text not null default 'Other',
  credit_card_id uuid references public.credit_cards(id) on delete set null,
  start_month text not null check (start_month ~ '^[0-9]{4}-[0-9]{2}$'),
  end_month text check (end_month is null or end_month ~ '^[0-9]{4}-[0-9]{2}$'),
  active boolean not null default true,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists recurring_payments_household_id_idx
  on public.recurring_payments (household_id);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  transaction_date date not null,
  merchant text not null,
  payment_method text not null default 'Credit Card',
  credit_card_id uuid references public.credit_cards(id) on delete set null,
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  notes text not null default '',
  source text not null default 'manual' check (source in ('manual', 'recurring', 'imported')),
  recurring_payment_id uuid references public.recurring_payments(id) on delete set null,
  recurring_month text check (recurring_month is null or recurring_month ~ '^[0-9]{4}-[0-9]{2}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_household_date_idx
  on public.transactions (household_id, transaction_date desc);

create index if not exists transactions_recurring_payment_idx
  on public.transactions (recurring_payment_id);

create table if not exists public.transaction_splits (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  transaction_id uuid not null references public.transactions(id) on delete cascade,
  category_id uuid references public.budget_categories(id) on delete set null,
  category_fallback text not null default 'Uncategorized',
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transaction_splits_household_id_idx
  on public.transaction_splits (household_id);

create index if not exists transaction_splits_transaction_id_idx
  on public.transaction_splits (transaction_id);

create table if not exists public.recurring_payment_instances (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  recurring_payment_id uuid not null references public.recurring_payments(id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  status text not null check (status in ('generated', 'skipped')),
  transaction_id uuid references public.transactions(id) on delete set null,
  actual_amount numeric(12, 2) check (actual_amount is null or actual_amount >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recurring_payment_id, month_key)
);

create index if not exists recurring_payment_instances_household_month_idx
  on public.recurring_payment_instances (household_id, month_key);

drop trigger if exists validate_monthly_card_balances_household_references on public.monthly_card_balances;
create trigger validate_monthly_card_balances_household_references
  before insert or update on public.monthly_card_balances
  for each row execute function public.validate_household_references();

drop trigger if exists validate_recurring_payments_household_references on public.recurring_payments;
create trigger validate_recurring_payments_household_references
  before insert or update on public.recurring_payments
  for each row execute function public.validate_household_references();

drop trigger if exists validate_transactions_household_references on public.transactions;
create trigger validate_transactions_household_references
  before insert or update on public.transactions
  for each row execute function public.validate_household_references();

drop trigger if exists validate_transaction_splits_household_references on public.transaction_splits;
create trigger validate_transaction_splits_household_references
  before insert or update on public.transaction_splits
  for each row execute function public.validate_household_references();

drop trigger if exists validate_recurring_payment_instances_household_references on public.recurring_payment_instances;
create trigger validate_recurring_payment_instances_household_references
  before insert or update on public.recurring_payment_instances
  for each row execute function public.validate_household_references();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_households_updated_at on public.households;
create trigger set_households_updated_at
  before update on public.households
  for each row execute function public.set_updated_at();

drop trigger if exists set_household_members_updated_at on public.household_members;
create trigger set_household_members_updated_at
  before update on public.household_members
  for each row execute function public.set_updated_at();

drop trigger if exists set_credit_cards_updated_at on public.credit_cards;
create trigger set_credit_cards_updated_at
  before update on public.credit_cards
  for each row execute function public.set_updated_at();

drop trigger if exists set_monthly_card_balances_updated_at on public.monthly_card_balances;
create trigger set_monthly_card_balances_updated_at
  before update on public.monthly_card_balances
  for each row execute function public.set_updated_at();

drop trigger if exists set_budget_categories_updated_at on public.budget_categories;
create trigger set_budget_categories_updated_at
  before update on public.budget_categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_recurring_payments_updated_at on public.recurring_payments;
create trigger set_recurring_payments_updated_at
  before update on public.recurring_payments
  for each row execute function public.set_updated_at();

drop trigger if exists set_transactions_updated_at on public.transactions;
create trigger set_transactions_updated_at
  before update on public.transactions
  for each row execute function public.set_updated_at();

drop trigger if exists set_transaction_splits_updated_at on public.transaction_splits;
create trigger set_transaction_splits_updated_at
  before update on public.transaction_splits
  for each row execute function public.set_updated_at();

drop trigger if exists set_recurring_payment_instances_updated_at on public.recurring_payment_instances;
create trigger set_recurring_payment_instances_updated_at
  before update on public.recurring_payment_instances
  for each row execute function public.set_updated_at();
