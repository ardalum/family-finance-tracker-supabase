-- Phase 12: database model foundation for better long-term finance tracking.
-- Run after 011_security_hardening.sql.
-- This migration is intentionally additive. Do not remove legacy tables yet because the current UI still depends on them.

-- 1) Stable category identity separate from monthly budget amounts.
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  name text not null,
  type text not null default 'expense' check (type in ('expense', 'income', 'transfer', 'adjustment')),
  is_active boolean not null default true,
  imported_local_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_name_not_blank check (length(trim(name)) > 0)
);

create index if not exists categories_household_id_idx
  on public.categories (household_id);

create unique index if not exists categories_household_name_type_unique
  on public.categories (household_id, lower(trim(name)), type);

create unique index if not exists categories_household_imported_local_id_unique
  on public.categories (household_id, imported_local_id)
  where imported_local_id is not null;

create table if not exists public.monthly_category_budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  budgeted_amount numeric(12, 2) not null default 0 check (budgeted_amount >= 0),
  notes text not null default '',
  imported_local_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (category_id, month_key)
);

create index if not exists monthly_category_budgets_household_month_idx
  on public.monthly_category_budgets (household_id, month_key);

create unique index if not exists monthly_category_budgets_household_imported_local_id_unique
  on public.monthly_category_budgets (household_id, imported_local_id)
  where imported_local_id is not null;

-- 2) Transaction type support. Amount remains positive. Direction/meaning comes from transaction_type.
alter table public.transactions
  add column if not exists transaction_type text not null default 'expense';

alter table public.transactions
  drop constraint if exists transactions_transaction_type_check;

alter table public.transactions
  add constraint transactions_transaction_type_check
  check (transaction_type in ('expense', 'refund', 'income', 'payment', 'transfer', 'adjustment'));

create index if not exists transactions_household_type_date_idx
  on public.transactions (household_id, transaction_type, transaction_date desc);

-- 3) Credit-card statement cycle model.
create table if not exists public.card_statements (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  credit_card_id uuid not null references public.credit_cards(id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  statement_period_start date,
  statement_period_end date,
  statement_close_date date,
  payment_due_date date,
  statement_balance numeric(12, 2) not null default 0 check (statement_balance >= 0),
  minimum_payment numeric(12, 2) not null default 0 check (minimum_payment >= 0),
  paid_amount numeric(12, 2) not null default 0 check (paid_amount >= 0),
  paid_date date,
  autopay_enabled boolean not null default false,
  autopay_date date,
  confirmation_number text not null default '',
  status text not null default 'unpaid' check (status in ('unpaid', 'partial', 'paid', 'overpaid', 'late', 'skipped')),
  imported_local_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (credit_card_id, month_key),
  constraint card_statements_period_order check (
    statement_period_start is null
    or statement_period_end is null
    or statement_period_start <= statement_period_end
  )
);

create index if not exists card_statements_household_month_idx
  on public.card_statements (household_id, month_key);

create index if not exists card_statements_household_due_idx
  on public.card_statements (household_id, payment_due_date);

create unique index if not exists card_statements_household_imported_local_id_unique
  on public.card_statements (household_id, imported_local_id)
  where imported_local_id is not null;

-- 4) Activity log foundation. This is a manual/helper-backed audit trail for app and function actions.
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('create', 'update', 'delete', 'restore', 'import', 'export', 'mark_paid', 'mark_unpaid', 'skip', 'reset')),
  entity_type text not null,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  created_at timestamptz not null default now(),
  constraint activity_log_entity_type_not_blank check (length(trim(entity_type)) > 0)
);

create index if not exists activity_log_household_created_idx
  on public.activity_log (household_id, created_at desc);

create index if not exists activity_log_entity_idx
  on public.activity_log (entity_type, entity_id);

create or replace function public.log_activity(
  target_household_id uuid,
  action_name text,
  entity_type_name text,
  target_entity_id uuid default null,
  old_record jsonb default null,
  new_record jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_log_id uuid;
begin
  if target_household_id is null then
    raise exception 'target_household_id is required.';
  end if;

  if auth.uid() is null then
    raise exception 'Must be signed in to log activity.';
  end if;

  if not public.is_household_member(target_household_id) then
    raise exception 'Must be an active household member to log activity.';
  end if;

  insert into public.activity_log (
    household_id,
    user_id,
    action,
    entity_type,
    entity_id,
    old_value,
    new_value
  )
  values (
    target_household_id,
    auth.uid(),
    action_name,
    entity_type_name,
    target_entity_id,
    old_record,
    new_record
  )
  returning id into new_log_id;

  return new_log_id;
end;
$$;

revoke execute on function public.log_activity(uuid, text, text, uuid, jsonb, jsonb) from public;
revoke execute on function public.log_activity(uuid, text, text, uuid, jsonb, jsonb) from anon;
grant execute on function public.log_activity(uuid, text, text, uuid, jsonb, jsonb) to authenticated;

-- 5) Household reference validation for the new tables.
create or replace function public.validate_finance_model_household_references()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'monthly_category_budgets' then
    if not exists (
      select 1 from public.categories c
      where c.id = new.category_id
        and c.household_id = new.household_id
    ) then
      raise exception 'monthly_category_budgets.category_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'card_statements' then
    if not exists (
      select 1 from public.credit_cards cc
      where cc.id = new.credit_card_id
        and cc.household_id = new.household_id
    ) then
      raise exception 'card_statements.credit_card_id must belong to the same household.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_monthly_category_budgets_household_references on public.monthly_category_budgets;
create trigger validate_monthly_category_budgets_household_references
  before insert or update on public.monthly_category_budgets
  for each row execute function public.validate_finance_model_household_references();

drop trigger if exists validate_card_statements_household_references on public.card_statements;
create trigger validate_card_statements_household_references
  before insert or update on public.card_statements
  for each row execute function public.validate_finance_model_household_references();

-- 6) updated_at triggers.
drop trigger if exists set_categories_updated_at on public.categories;
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

drop trigger if exists set_monthly_category_budgets_updated_at on public.monthly_category_budgets;
create trigger set_monthly_category_budgets_updated_at
  before update on public.monthly_category_budgets
  for each row execute function public.set_updated_at();

drop trigger if exists set_card_statements_updated_at on public.card_statements;
create trigger set_card_statements_updated_at
  before update on public.card_statements
  for each row execute function public.set_updated_at();

-- 7) RLS policies for new tables.
alter table public.categories enable row level security;
alter table public.monthly_category_budgets enable row level security;
alter table public.card_statements enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "Categories are visible to household members" on public.categories;
create policy "Categories are visible to household members"
  on public.categories for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Categories are editable by household admins" on public.categories;
create policy "Categories are editable by household admins"
  on public.categories for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Monthly category budgets are visible to household members" on public.monthly_category_budgets;
create policy "Monthly category budgets are visible to household members"
  on public.monthly_category_budgets for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Monthly category budgets are editable by household admins" on public.monthly_category_budgets;
create policy "Monthly category budgets are editable by household admins"
  on public.monthly_category_budgets for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Card statements are visible to household members" on public.card_statements;
create policy "Card statements are visible to household members"
  on public.card_statements for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Card statements are editable by household admins" on public.card_statements;
create policy "Card statements are editable by household admins"
  on public.card_statements for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Activity log is visible to household members" on public.activity_log;
create policy "Activity log is visible to household members"
  on public.activity_log for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Activity log is insertable by household members" on public.activity_log;
create policy "Activity log is insertable by household members"
  on public.activity_log for insert
  to authenticated
  with check (public.is_household_member(household_id) and user_id = auth.uid());

-- No update/delete policy for activity_log. Audit records should be append-only from the client side.

-- 8) Backfill stable categories and monthly budgets from the existing month-specific budget_categories table.
insert into public.categories (household_id, name, type, imported_local_id, created_at, updated_at)
select distinct on (bc.household_id, lower(trim(bc.name)))
  bc.household_id,
  trim(bc.name),
  'expense',
  null,
  min(bc.created_at) over (partition by bc.household_id, lower(trim(bc.name))),
  max(bc.updated_at) over (partition by bc.household_id, lower(trim(bc.name)))
from public.budget_categories bc
where nullif(trim(bc.name), '') is not null
order by bc.household_id, lower(trim(bc.name)), bc.created_at
on conflict do nothing;

insert into public.monthly_category_budgets (
  household_id,
  category_id,
  month_key,
  budgeted_amount,
  notes,
  imported_local_id,
  created_at,
  updated_at
)
select
  bc.household_id,
  c.id,
  bc.month_key,
  bc.monthly_amount,
  bc.notes,
  bc.imported_local_id,
  bc.created_at,
  bc.updated_at
from public.budget_categories bc
join public.categories c
  on c.household_id = bc.household_id
 and c.type = 'expense'
 and lower(trim(c.name)) = lower(trim(bc.name))
on conflict do nothing;

-- 9) Backfill card statements from legacy monthly_card_balances where possible.
insert into public.card_statements (
  household_id,
  credit_card_id,
  month_key,
  statement_balance,
  paid_amount,
  status,
  imported_local_id,
  created_at,
  updated_at
)
select
  mcb.household_id,
  mcb.credit_card_id,
  mcb.month_key,
  mcb.balance,
  case when mcb.paid then mcb.balance else 0 end,
  case
    when mcb.paid and mcb.balance > 0 then 'paid'
    when mcb.paid and mcb.balance = 0 then 'paid'
    else 'unpaid'
  end,
  mcb.id::text,
  mcb.created_at,
  mcb.updated_at
from public.monthly_card_balances mcb
on conflict do nothing;

select pg_notify('pgrst', 'reload schema');
