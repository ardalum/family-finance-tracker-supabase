-- Phase 9: household profile labels for credit card owners.
-- Household profiles are simple owner labels inside a household, not auth users.

create table if not exists public.household_profiles (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  display_name text not null,
  role_label text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint household_profiles_display_name_not_blank check (length(trim(display_name)) > 0)
);

create index if not exists household_profiles_household_id_idx
  on public.household_profiles (household_id);

create unique index if not exists household_profiles_household_display_name_unique
  on public.household_profiles (household_id, lower(trim(display_name)));

alter table public.credit_cards
  add column if not exists owner_profile_id uuid references public.household_profiles(id) on delete set null;

create index if not exists credit_cards_owner_profile_id_idx
  on public.credit_cards (owner_profile_id);

alter table public.household_profiles enable row level security;

drop policy if exists "Household profiles are visible to household members" on public.household_profiles;
create policy "Household profiles are visible to household members"
  on public.household_profiles for select
  to authenticated
  using (public.is_household_member(household_id));

drop policy if exists "Household profiles are editable by household members" on public.household_profiles;
create policy "Household profiles are editable by household members"
  on public.household_profiles for all
  to authenticated
  using (public.can_edit_household(household_id))
  with check (public.can_edit_household(household_id));

drop trigger if exists set_household_profiles_updated_at on public.household_profiles;
create trigger set_household_profiles_updated_at
  before update on public.household_profiles
  for each row execute function public.set_updated_at();

create or replace function public.validate_credit_card_owner_profile()
returns trigger
language plpgsql
as $$
begin
  if new.owner_profile_id is not null and not exists (
    select 1 from public.household_profiles hp
    where hp.id = new.owner_profile_id
      and hp.household_id = new.household_id
  ) then
    raise exception 'credit_cards.owner_profile_id must belong to the same household.';
  end if;

  return new;
end;
$$;

drop trigger if exists validate_credit_card_owner_profile on public.credit_cards;
create trigger validate_credit_card_owner_profile
  before insert or update on public.credit_cards
  for each row execute function public.validate_credit_card_owner_profile();

insert into public.household_profiles (household_id, display_name)
select distinct
  cc.household_id,
  trim(cc.owner_name)
from public.credit_cards cc
where nullif(trim(cc.owner_name), '') is not null
on conflict do nothing;

update public.credit_cards cc
set owner_profile_id = hp.id
from public.household_profiles hp
where cc.owner_profile_id is null
  and hp.household_id = cc.household_id
  and lower(trim(hp.display_name)) = lower(trim(cc.owner_name));

select pg_notify('pgrst', 'reload schema');
