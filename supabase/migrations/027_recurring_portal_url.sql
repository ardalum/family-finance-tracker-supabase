alter table public.recurring_payments
  add column if not exists portal_url text;

select pg_notify('pgrst', 'reload schema');