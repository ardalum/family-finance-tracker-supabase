-- Phase 8: recurring payment import tracking needed for duplicate-safe local imports.

alter table public.recurring_payments
  add column if not exists imported_local_id text;

create unique index if not exists recurring_payments_household_imported_local_id_unique
  on public.recurring_payments (household_id, imported_local_id);
