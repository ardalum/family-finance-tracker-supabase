-- Phase 4: credit card import tracking needed for duplicate-safe local imports.

alter table public.credit_cards
  add column if not exists imported_local_id text;

create unique index if not exists credit_cards_household_imported_local_id_unique
  on public.credit_cards (household_id, imported_local_id);
