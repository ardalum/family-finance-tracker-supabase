-- Store account-level source for autopay configurations.
alter table public.credit_cards
  add column if not exists autopay_payment_account_id text;

alter table public.recurring_payments
  add column if not exists autopay_payment_account_id text;

select pg_notify('pgrst', 'reload schema');