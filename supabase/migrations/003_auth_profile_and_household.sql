-- Phase 2: auth helpers.
-- Run after 001_initial_schema.sql and 002_rls_policies.sql.

create or replace function public.ensure_user_has_household(
  target_user_id uuid,
  household_name text default 'My Household'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  existing_household_id uuid;
  new_household_id uuid;
  clean_name text;
begin
  if target_user_id is null then
    raise exception 'target_user_id is required.';
  end if;

  select hm.household_id
    into existing_household_id
  from public.household_members hm
  where hm.user_id = target_user_id
    and hm.status = 'active'
  order by hm.joined_at nulls last, hm.created_at
  limit 1;

  if existing_household_id is not null then
    return existing_household_id;
  end if;

  clean_name := nullif(trim(household_name), '');

  insert into public.households (name, created_by)
  values (coalesce(clean_name, 'My Household'), target_user_id)
  returning id into new_household_id;

  insert into public.household_members (
    household_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (
    new_household_id,
    target_user_id,
    'owner',
    'active',
    now()
  );

  return new_household_id;
end;
$$;

revoke execute on function public.ensure_user_has_household(uuid, text) from public;
revoke execute on function public.ensure_user_has_household(uuid, text) from anon;
revoke execute on function public.ensure_user_has_household(uuid, text) from authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name')
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();

  perform public.ensure_user_has_household(new.id, 'My Household');

  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

insert into public.profiles (id, email, display_name)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'display_name', users.raw_user_meta_data ->> 'full_name')
from auth.users
on conflict (id) do update
  set email = excluded.email,
      updated_at = now();

select public.ensure_user_has_household(users.id, 'My Household')
from auth.users;

create or replace function public.create_household_for_current_user(household_name text default 'My Household')
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household public.households;
  clean_name text;
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to create a household.';
  end if;

  clean_name := nullif(trim(household_name), '');

  insert into public.households (name, created_by)
  values (coalesce(clean_name, 'My Household'), auth.uid())
  returning * into new_household;

  insert into public.household_members (
    household_id,
    user_id,
    role,
    status,
    joined_at
  )
  values (
    new_household.id,
    auth.uid(),
    'owner',
    'active',
    now()
  )
  on conflict do nothing;

  return new_household;
end;
$$;

revoke execute on function public.create_household_for_current_user(text) from public;
revoke execute on function public.create_household_for_current_user(text) from anon;
grant execute on function public.create_household_for_current_user(text) to authenticated;

create or replace function public.create_first_household_for_current_user(household_name text default 'My Household')
returns uuid
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Must be signed in to create a household.';
  end if;

  return public.ensure_user_has_household(auth.uid(), household_name);
end;
$$;

revoke execute on function public.create_first_household_for_current_user(text) from public;
revoke execute on function public.create_first_household_for_current_user(text) from anon;
grant execute on function public.create_first_household_for_current_user(text) to authenticated;
