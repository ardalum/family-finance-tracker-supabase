-- Add autopay flags for credit card definitions and recurring bill templates.
-- Keep this migration additive and backward-compatible.

alter table public.credit_cards
  add column if not exists autopay_enabled boolean not null default false;

alter table public.recurring_payments
  add column if not exists autopay_enabled boolean not null default false;

select pg_notify('pgrst', 'reload schema');
