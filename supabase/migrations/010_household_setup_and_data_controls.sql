-- Phase 10: first-time setup status for households.
-- Run after 009_household_profiles.sql.

alter table public.households
  add column if not exists setup_complete boolean not null default false,
  add column if not exists setup_completed_at timestamptz;

select pg_notify('pgrst', 'reload schema');
