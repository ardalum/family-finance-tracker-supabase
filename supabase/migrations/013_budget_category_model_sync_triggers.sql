-- Phase 13: keep the new category model synced when legacy budget_categories rows change.
-- Run after 012_database_model_foundation.sql.
--
-- Why this exists:
-- The current app and backup/import flow still use public.budget_categories for compatibility.
-- The newer model uses public.categories + public.monthly_category_budgets.
-- These triggers make legacy budget imports/updates populate the new model automatically.

create or replace function public.find_or_create_expense_category(
  target_household_id uuid,
  category_name text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  clean_name text;
  category_id uuid;
begin
  clean_name := trim(coalesce(category_name, ''));

  if target_household_id is null then
    raise exception 'target_household_id is required.';
  end if;

  if clean_name = '' then
    raise exception 'category_name is required.';
  end if;

  select c.id
    into category_id
  from public.categories c
  where c.household_id = target_household_id
    and c.type = 'expense'
    and lower(trim(c.name)) = lower(clean_name)
  order by c.created_at asc
  limit 1;

  if category_id is not null then
    update public.categories
       set is_active = true,
           name = clean_name
     where id = category_id;

    return category_id;
  end if;

  insert into public.categories (
    household_id,
    name,
    type,
    is_active
  )
  values (
    target_household_id,
    clean_name,
    'expense',
    true
  )
  returning id into category_id;

  return category_id;
end;
$$;

revoke execute on function public.find_or_create_expense_category(uuid, text) from public;
revoke execute on function public.find_or_create_expense_category(uuid, text) from anon;
grant execute on function public.find_or_create_expense_category(uuid, text) to authenticated;

create or replace function public.sync_budget_category_to_category_model()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  synced_category_id uuid;
  old_category_id uuid;
begin
  if tg_op = 'DELETE' then
    select c.id
      into old_category_id
    from public.categories c
    where c.household_id = old.household_id
      and c.type = 'expense'
      and lower(trim(c.name)) = lower(trim(old.name))
    order by c.created_at asc
    limit 1;

    if old_category_id is not null then
      delete from public.monthly_category_budgets mcb
      where mcb.household_id = old.household_id
        and mcb.category_id = old_category_id
        and mcb.month_key = old.month_key;
    end if;

    return old;
  end if;

  if tg_op = 'UPDATE' then
    if old.household_id is distinct from new.household_id
      or old.month_key is distinct from new.month_key
      or lower(trim(old.name)) is distinct from lower(trim(new.name))
    then
      select c.id
        into old_category_id
      from public.categories c
      where c.household_id = old.household_id
        and c.type = 'expense'
        and lower(trim(c.name)) = lower(trim(old.name))
      order by c.created_at asc
      limit 1;

      if old_category_id is not null then
        delete from public.monthly_category_budgets mcb
        where mcb.household_id = old.household_id
          and mcb.category_id = old_category_id
          and mcb.month_key = old.month_key;
      end if;
    end if;
  end if;

  synced_category_id := public.find_or_create_expense_category(new.household_id, new.name);

  insert into public.monthly_category_budgets (
    household_id,
    category_id,
    month_key,
    budgeted_amount,
    notes,
    imported_local_id,
    created_at,
    updated_at
  )
  values (
    new.household_id,
    synced_category_id,
    new.month_key,
    coalesce(new.monthly_amount, 0),
    coalesce(new.notes, ''),
    new.imported_local_id,
    new.created_at,
    new.updated_at
  )
  on conflict (category_id, month_key)
  do update set
    budgeted_amount = excluded.budgeted_amount,
    notes = excluded.notes,
    imported_local_id = coalesce(excluded.imported_local_id, public.monthly_category_budgets.imported_local_id),
    updated_at = now();

  return new;
end;
$$;

-- Trigger after writes so imported/restored legacy budget rows automatically hydrate the new model.
drop trigger if exists sync_budget_category_to_category_model_on_insert_update on public.budget_categories;
create trigger sync_budget_category_to_category_model_on_insert_update
  after insert or update on public.budget_categories
  for each row execute function public.sync_budget_category_to_category_model();

drop trigger if exists sync_budget_category_to_category_model_on_delete on public.budget_categories;
create trigger sync_budget_category_to_category_model_on_delete
  after delete on public.budget_categories
  for each row execute function public.sync_budget_category_to_category_model();

-- One-time repair/backfill for any legacy rows inserted before this trigger exists.
insert into public.categories (household_id, name, type, is_active, created_at, updated_at)
select distinct on (bc.household_id, lower(trim(bc.name)))
  bc.household_id,
  trim(bc.name),
  'expense',
  true,
  min(bc.created_at) over (partition by bc.household_id, lower(trim(bc.name))),
  max(bc.updated_at) over (partition by bc.household_id, lower(trim(bc.name)))
from public.budget_categories bc
where nullif(trim(bc.name), '') is not null
order by bc.household_id, lower(trim(bc.name)), bc.created_at
on conflict do nothing;

insert into public.monthly_category_budgets (
  household_id,
  category_id,
  month_key,
  budgeted_amount,
  notes,
  imported_local_id,
  created_at,
  updated_at
)
select
  bc.household_id,
  c.id,
  bc.month_key,
  coalesce(bc.monthly_amount, 0),
  coalesce(bc.notes, ''),
  bc.imported_local_id,
  bc.created_at,
  bc.updated_at
from public.budget_categories bc
join public.categories c
  on c.household_id = bc.household_id
 and c.type = 'expense'
 and lower(trim(c.name)) = lower(trim(bc.name))
on conflict (category_id, month_key)
do update set
  budgeted_amount = excluded.budgeted_amount,
  notes = excluded.notes,
  imported_local_id = coalesce(excluded.imported_local_id, public.monthly_category_budgets.imported_local_id),
  updated_at = now();

select pg_notify('pgrst', 'reload schema');
