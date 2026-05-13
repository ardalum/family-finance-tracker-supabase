-- Phase 11: security hardening for household roles and destructive finance actions.
-- Run after 010_household_setup_and_data_controls.sql.

-- Keep the older helper for backwards compatibility, but make the meaning stricter.
-- From this migration forward, shared finance data is editable only by owner/admin.
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
      and hm.role in ('owner', 'admin')
  );
$$;

create or replace function public.can_manage_household(target_household_id uuid)
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

create or replace function public.can_manage_members(target_household_id uuid)
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

create or replace function public.can_manage_finance_data(target_household_id uuid)
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

create or replace function public.can_delete_household_finance_data(target_household_id uuid)
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

revoke execute on function public.can_manage_household(uuid) from public;
revoke execute on function public.can_manage_members(uuid) from public;
revoke execute on function public.can_manage_finance_data(uuid) from public;
revoke execute on function public.can_delete_household_finance_data(uuid) from public;
grant execute on function public.can_manage_household(uuid) to authenticated;
grant execute on function public.can_manage_members(uuid) to authenticated;
grant execute on function public.can_manage_finance_data(uuid) to authenticated;
grant execute on function public.can_delete_household_finance_data(uuid) to authenticated;

-- Household members: only owner/admin can invite or edit membership.
drop policy if exists "Household members are insertable by admins" on public.household_members;
create policy "Household members are insertable by admins"
  on public.household_members for insert
  to authenticated
  with check (public.can_manage_members(household_id));

drop policy if exists "Household members are updatable by admins" on public.household_members;
create policy "Household members are updatable by admins"
  on public.household_members for update
  to authenticated
  using (public.can_manage_members(household_id))
  with check (public.can_manage_members(household_id));

drop policy if exists "Household members are deletable by admins" on public.household_members;
create policy "Household members are deletable by admins"
  on public.household_members for delete
  to authenticated
  using (public.can_manage_members(household_id));

-- Shared finance tables: owner/admin can write; member/viewer can read through the existing select policies.
drop policy if exists "Credit cards are editable by household members" on public.credit_cards;
create policy "Credit cards are editable by household admins"
  on public.credit_cards for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Monthly balances are editable by household members" on public.monthly_card_balances;
create policy "Monthly balances are editable by household admins"
  on public.monthly_card_balances for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Budget categories are editable by household members" on public.budget_categories;
create policy "Budget categories are editable by household admins"
  on public.budget_categories for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Transactions are editable by household members" on public.transactions;
create policy "Transactions are editable by household admins"
  on public.transactions for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Transaction splits are editable by household members" on public.transaction_splits;
create policy "Transaction splits are editable by household admins"
  on public.transaction_splits for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Recurring payments are editable by household members" on public.recurring_payments;
create policy "Recurring payments are editable by household admins"
  on public.recurring_payments for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Recurring payment instances are editable by household members" on public.recurring_payment_instances;
create policy "Recurring payment instances are editable by household admins"
  on public.recurring_payment_instances for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

drop policy if exists "Household profiles are editable by household members" on public.household_profiles;
create policy "Household profiles are editable by household admins"
  on public.household_profiles for all
  to authenticated
  using (public.can_manage_finance_data(household_id))
  with check (public.can_manage_finance_data(household_id));

select pg_notify('pgrst', 'reload schema');
