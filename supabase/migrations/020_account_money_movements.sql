-- Phase 32: Account-linked money movement foundation.
-- This model supports projected balances only. Account balance snapshots remain
-- the source of truth for actual balances.

create table if not exists public.account_money_movements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  account_id uuid references public.cash_accounts(id) on delete set null,
  source_type text not null
    check (source_type in (
      'income_entry',
      'spending_transaction',
      'recurring_payment',
      'credit_card_payment',
      'manual_adjustment'
    )),
  source_id uuid,
  movement_type text not null
    check (movement_type in (
      'income_deposit',
      'spending_payment',
      'recurring_bill_payment',
      'credit_card_payment',
      'adjustment'
    )),
  direction text not null check (direction in ('inflow', 'outflow')),
  amount numeric(12, 2) not null check (amount >= 0),
  movement_date date not null,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  description text not null default '',
  is_tracked boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_money_movements_tracked_account_required
    check ((is_tracked = false) or (account_id is not null))
);

create unique index if not exists account_money_movements_source_unique_idx
  on public.account_money_movements (household_id, source_type, source_id)
  where source_id is not null;

create index if not exists account_money_movements_household_month_idx
  on public.account_money_movements (household_id, month_key);

create index if not exists account_money_movements_account_month_idx
  on public.account_money_movements (account_id, month_key)
  where account_id is not null;

create index if not exists account_money_movements_source_idx
  on public.account_money_movements (source_type, source_id)
  where source_id is not null;

create index if not exists account_money_movements_tracked_idx
  on public.account_money_movements (household_id, is_tracked, month_key);

drop trigger if exists set_account_money_movements_updated_at on public.account_money_movements;
create trigger set_account_money_movements_updated_at
  before update on public.account_money_movements
  for each row execute function public.set_updated_at();

alter table public.account_money_movements enable row level security;

drop policy if exists "Account money movements are visible to household members" on public.account_money_movements;
create policy "Account money movements are visible to household members"
  on public.account_money_movements for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Account money movements are editable by household members" on public.account_money_movements;
create policy "Account money movements are editable by household members"
  on public.account_money_movements for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

select pg_notify('pgrst', 'reload schema');
