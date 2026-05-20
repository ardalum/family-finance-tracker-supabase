-- Allow composite source ids such as "<credit_card_id>:<statement_month_key>"
-- for account-linked money movements.

alter table if exists public.account_money_movements
  alter column source_id type text using source_id::text;

drop index if exists public.account_money_movements_source_unique_idx;
create unique index if not exists account_money_movements_source_unique_idx
  on public.account_money_movements (household_id, source_type, source_id);

drop index if exists public.account_money_movements_source_idx;
create index if not exists account_money_movements_source_idx
  on public.account_money_movements (source_type, source_id);

-- Keep API schema cache in sync after DDL.
select pg_notify('pgrst', 'reload schema');
