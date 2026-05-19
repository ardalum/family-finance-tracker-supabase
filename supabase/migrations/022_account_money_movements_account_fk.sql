-- Keep tracked money movement account references consistent when a cash account is removed.
-- Account balance snapshots cascade with cash accounts, and projected movement rows should
-- not remain tracked without an account.

alter table if exists public.account_money_movements
  drop constraint if exists account_money_movements_account_id_fkey;

alter table if exists public.account_money_movements
  add constraint account_money_movements_account_id_fkey
  foreign key (account_id)
  references public.cash_accounts(id)
  on delete cascade;

select pg_notify('pgrst', 'reload schema');
