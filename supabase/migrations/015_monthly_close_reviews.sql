-- Phase 15: monthly close review persistence.
-- Stores household + month review state and manual checklist confirmations.

create table if not exists public.monthly_close_reviews (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  month_key text not null check (month_key ~ '^[0-9]{4}-[0-9]{2}$'),
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  status text not null default 'in_progress' check (status in ('in_progress', 'reviewed')),
  manual_checks jsonb not null default '{}'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (household_id, month_key)
);

create index if not exists monthly_close_reviews_household_month_idx
  on public.monthly_close_reviews (household_id, month_key);

create index if not exists monthly_close_reviews_household_status_idx
  on public.monthly_close_reviews (household_id, status);

drop trigger if exists set_monthly_close_reviews_updated_at on public.monthly_close_reviews;
create trigger set_monthly_close_reviews_updated_at
  before update on public.monthly_close_reviews
  for each row execute function public.set_updated_at();

alter table public.monthly_close_reviews enable row level security;

drop policy if exists "Monthly close reviews are visible to household members" on public.monthly_close_reviews;
create policy "Monthly close reviews are visible to household members"
  on public.monthly_close_reviews for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Monthly close reviews are editable by household members" on public.monthly_close_reviews;
create policy "Monthly close reviews are editable by household members"
  on public.monthly_close_reviews for all
  to authenticated
  using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

