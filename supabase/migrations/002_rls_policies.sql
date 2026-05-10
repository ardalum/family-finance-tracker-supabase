-- Phase 2: Row Level Security policies.
-- Run after 001_initial_schema.sql and before/after 003_auth_profile_and_household.sql.

create or replace function public.is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
      and hm.status = 'active'
  );
$$;

create or replace function public.can_edit_household(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
      and hm.status = 'active'
      and hm.role in ('owner', 'admin', 'member')
  );
$$;

create or replace function public.can_admin_household(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
      and hm.status = 'active'
      and hm.role in ('owner', 'admin')
  );
$$;

create or replace function public.is_household_owner(target_household_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.household_members hm
    where hm.household_id = target_household_id
      and hm.user_id = auth.uid()
      and hm.status = 'active'
      and hm.role = 'owner'
  );
$$;

alter table public.profiles enable row level security;
alter table public.households enable row level security;
alter table public.household_members enable row level security;
alter table public.credit_cards enable row level security;
alter table public.monthly_card_balances enable row level security;
alter table public.budget_categories enable row level security;
alter table public.transactions enable row level security;
alter table public.transaction_splits enable row level security;
alter table public.recurring_payments enable row level security;
alter table public.recurring_payment_instances enable row level security;

drop policy if exists "Profiles are visible to owner" on public.profiles;
create policy "Profiles are visible to owner"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "Profiles are insertable by owner" on public.profiles;
create policy "Profiles are insertable by owner"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "Profiles are updatable by owner" on public.profiles;
create policy "Profiles are updatable by owner"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "Households are visible to members" on public.households;
create policy "Households are visible to members"
  on public.households for select
  to authenticated
  using (public.is_household_member(id));

drop policy if exists "Households can be created by signed in users" on public.households;

drop policy if exists "Households are updatable by admins" on public.households;
create policy "Households are updatable by admins"
  on public.households for update
  to authenticated
  using (public.can_admin_household(id))
  with check (public.can_admin_household(id));

drop policy if exists "Households are deletable by owners" on public.households;
create policy "Households are deletable by owners"
  on public.households for delete
  to authenticated
  using (public.is_household_owner(id));

drop policy if exists "Household members are visible to household members" on public.household_members;
create policy "Household members are visible to household members"
  on public.household_members for select
  to authenticated
  using (public.is_household_member(household_id) or user_id = auth.uid());

drop policy if exists "Household members are insertable by admins" on public.household_members;
create policy "Household members are insertable by admins"
  on public.household_members for insert
  to authenticated
  with check (public.can_admin_household(household_id));

drop policy if exists "Household members are updatable by admins" on public.household_members;
create policy "Household members are updatable by admins"
  on public.household_members for update
  to authenticated
  using (public.can_admin_household(household_id))
  with check (public.can_admin_household(household_id));

drop policy if exists "Household members are deletable by admins" on public.household_members;
create policy "Household members are deletable by admins"
  on public.household_members for delete
  to authenticated
  using (public.can_admin_household(household_id));

drop policy if exists "Credit cards are visible to household members" on public.credit_cards;
create policy "Credit cards are visible to household members"
  on public.credit_cards for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Credit cards are editable by household members" on public.credit_cards;
create policy "Credit cards are editable by household members"
  on public.credit_cards for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));

drop policy if exists "Monthly balances are visible to household members" on public.monthly_card_balances;
create policy "Monthly balances are visible to household members"
  on public.monthly_card_balances for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Monthly balances are editable by household members" on public.monthly_card_balances;
create policy "Monthly balances are editable by household members"
  on public.monthly_card_balances for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));

drop policy if exists "Budget categories are visible to household members" on public.budget_categories;
create policy "Budget categories are visible to household members"
  on public.budget_categories for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Budget categories are editable by household members" on public.budget_categories;
create policy "Budget categories are editable by household members"
  on public.budget_categories for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));

drop policy if exists "Transactions are visible to household members" on public.transactions;
create policy "Transactions are visible to household members"
  on public.transactions for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Transactions are editable by household members" on public.transactions;
create policy "Transactions are editable by household members"
  on public.transactions for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));

drop policy if exists "Transaction splits are visible to household members" on public.transaction_splits;
create policy "Transaction splits are visible to household members"
  on public.transaction_splits for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Transaction splits are editable by household members" on public.transaction_splits;
create policy "Transaction splits are editable by household members"
  on public.transaction_splits for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));

drop policy if exists "Recurring payments are visible to household members" on public.recurring_payments;
create policy "Recurring payments are visible to household members"
  on public.recurring_payments for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Recurring payments are editable by household members" on public.recurring_payments;
create policy "Recurring payments are editable by household members"
  on public.recurring_payments for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));

drop policy if exists "Recurring payment instances are visible to household members" on public.recurring_payment_instances;
create policy "Recurring payment instances are visible to household members"
  on public.recurring_payment_instances for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Recurring payment instances are editable by household members" on public.recurring_payment_instances;
create policy "Recurring payment instances are editable by household members"
  on public.recurring_payment_instances for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));
