-- Phase 6: budget category import tracking needed for duplicate-safe local imports.

alter table public.budget_categories
  add column if not exists imported_local_id text;

create unique index if not exists budget_categories_household_imported_local_id_unique
  on public.budget_categories (household_id, imported_local_id);
