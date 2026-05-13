-- Phase 14: keep card_statements synced from legacy monthly_card_balances.
-- Run after 012_database_model_foundation.sql.
--
-- The current UI still uses monthly_card_balances for compatibility.
-- These triggers ensure richer card_statements rows are maintained whenever legacy balances change.

create or replace function public.get_safe_statement_date(
  target_year integer,
  target_month integer,
  target_day integer
)
returns date
language sql
immutable
as $$
  select make_date(
    target_year,
    target_month,
    least(
      greatest(coalesce(target_day, 1), 1),
      extract(day from (date_trunc('month', make_date(target_year, target_month, 1)) + interval '1 month - 1 day'))::integer
    )
  );
$$;

create or replace function public.sync_monthly_balance_to_card_statement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_year integer;
  target_month integer;
  next_year integer;
  next_month integer;
  card_record record;
  close_date date;
  due_date date;
begin
  if tg_op = 'DELETE' then
    delete from public.card_statements cs
    where cs.household_id = old.household_id
      and cs.credit_card_id = old.credit_card_id
      and cs.month_key = old.month_key;

    return old;
  end if;

  select cc.statement_closing_day, cc.due_day
    into card_record
  from public.credit_cards cc
  where cc.id = new.credit_card_id
    and cc.household_id = new.household_id;

  if not found then
    raise exception 'monthly_card_balances.credit_card_id must belong to the same household.';
  end if;

  target_year := substring(new.month_key from 1 for 4)::integer;
  target_month := substring(new.month_key from 6 for 2)::integer;

  if target_month = 12 then
    next_year := target_year + 1;
    next_month := 1;
  else
    next_year := target_year;
    next_month := target_month + 1;
  end if;

  close_date := public.get_safe_statement_date(target_year, target_month, card_record.statement_closing_day);
  due_date := public.get_safe_statement_date(next_year, next_month, card_record.due_day);

  insert into public.card_statements (
    household_id,
    credit_card_id,
    month_key,
    statement_close_date,
    payment_due_date,
    statement_balance,
    paid_amount,
    paid_date,
    status,
    imported_local_id,
    created_at,
    updated_at
  )
  values (
    new.household_id,
    new.credit_card_id,
    new.month_key,
    close_date,
    due_date,
    coalesce(new.balance, 0),
    case when new.paid then coalesce(new.balance, 0) else 0 end,
    case when new.paid then current_date else null end,
    case when new.paid or coalesce(new.balance, 0) = 0 then 'paid' else 'unpaid' end,
    new.id::text,
    new.created_at,
    new.updated_at
  )
  on conflict (credit_card_id, month_key)
  do update set
    statement_close_date = excluded.statement_close_date,
    payment_due_date = excluded.payment_due_date,
    statement_balance = excluded.statement_balance,
    paid_amount = excluded.paid_amount,
    paid_date = case
      when excluded.status = 'paid' and public.card_statements.paid_date is null then current_date
      when excluded.status <> 'paid' then null
      else public.card_statements.paid_date
    end,
    status = excluded.status,
    imported_local_id = coalesce(public.card_statements.imported_local_id, excluded.imported_local_id),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists sync_monthly_balance_to_card_statement_on_insert_update on public.monthly_card_balances;
create trigger sync_monthly_balance_to_card_statement_on_insert_update
  after insert or update on public.monthly_card_balances
  for each row execute function public.sync_monthly_balance_to_card_statement();

drop trigger if exists sync_monthly_balance_to_card_statement_on_delete on public.monthly_card_balances;
create trigger sync_monthly_balance_to_card_statement_on_delete
  after delete on public.monthly_card_balances
  for each row execute function public.sync_monthly_balance_to_card_statement();

-- Repair/backfill legacy rows into the richer statement table.
insert into public.card_statements (
  household_id,
  credit_card_id,
  month_key,
  statement_close_date,
  payment_due_date,
  statement_balance,
  paid_amount,
  paid_date,
  status,
  imported_local_id,
  created_at,
  updated_at
)
select
  mcb.household_id,
  mcb.credit_card_id,
  mcb.month_key,
  public.get_safe_statement_date(
    substring(mcb.month_key from 1 for 4)::integer,
    substring(mcb.month_key from 6 for 2)::integer,
    cc.statement_closing_day
  ),
  public.get_safe_statement_date(
    case when substring(mcb.month_key from 6 for 2)::integer = 12
      then substring(mcb.month_key from 1 for 4)::integer + 1
      else substring(mcb.month_key from 1 for 4)::integer
    end,
    case when substring(mcb.month_key from 6 for 2)::integer = 12
      then 1
      else substring(mcb.month_key from 6 for 2)::integer + 1
    end,
    cc.due_day
  ),
  coalesce(mcb.balance, 0),
  case when mcb.paid then coalesce(mcb.balance, 0) else 0 end,
  case when mcb.paid then current_date else null end,
  case when mcb.paid or coalesce(mcb.balance, 0) = 0 then 'paid' else 'unpaid' end,
  mcb.id::text,
  mcb.created_at,
  mcb.updated_at
from public.monthly_card_balances mcb
join public.credit_cards cc
  on cc.id = mcb.credit_card_id
 and cc.household_id = mcb.household_id
on conflict (credit_card_id, month_key)
do update set
  statement_close_date = excluded.statement_close_date,
  payment_due_date = excluded.payment_due_date,
  statement_balance = excluded.statement_balance,
  paid_amount = excluded.paid_amount,
  status = excluded.status,
  imported_local_id = coalesce(public.card_statements.imported_local_id, excluded.imported_local_id),
  updated_at = now();

select pg_notify('pgrst', 'reload schema');
