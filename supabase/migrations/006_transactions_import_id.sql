-- Phase 7: transaction import tracking needed for duplicate-safe local imports.

alter table public.transactions
  add column if not exists imported_local_id text;

create unique index if not exists transactions_household_imported_local_id_unique
  on public.transactions (household_id, imported_local_id);
