-- Spending form fix: allow normal non-split transactions to store one main category.

alter table public.transactions
  add column if not exists category_id uuid references public.budget_categories(id) on delete set null;

notify pgrst, 'reload schema';

create or replace function public.validate_household_references()
returns trigger
language plpgsql
as $$
begin
  if tg_table_name = 'monthly_card_balances' then
    if not exists (
      select 1 from public.credit_cards cc
      where cc.id = new.credit_card_id
        and cc.household_id = new.household_id
    ) then
      raise exception 'monthly_card_balances.credit_card_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'recurring_payments' then
    if new.credit_card_id is not null and not exists (
      select 1 from public.credit_cards cc
      where cc.id = new.credit_card_id
        and cc.household_id = new.household_id
    ) then
      raise exception 'recurring_payments.credit_card_id must belong to the same household.';
    end if;

    if new.category_id is not null and not exists (
      select 1 from public.budget_categories bc
      where bc.id = new.category_id
        and bc.household_id = new.household_id
    ) then
      raise exception 'recurring_payments.category_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'transactions' then
    if new.credit_card_id is not null and not exists (
      select 1 from public.credit_cards cc
      where cc.id = new.credit_card_id
        and cc.household_id = new.household_id
    ) then
      raise exception 'transactions.credit_card_id must belong to the same household.';
    end if;

    if new.recurring_payment_id is not null and not exists (
      select 1 from public.recurring_payments rp
      where rp.id = new.recurring_payment_id
        and rp.household_id = new.household_id
    ) then
      raise exception 'transactions.recurring_payment_id must belong to the same household.';
    end if;

    if new.category_id is not null and not exists (
      select 1 from public.budget_categories bc
      where bc.id = new.category_id
        and bc.household_id = new.household_id
    ) then
      raise exception 'transactions.category_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'transaction_splits' then
    if not exists (
      select 1 from public.transactions t
      where t.id = new.transaction_id
        and t.household_id = new.household_id
    ) then
      raise exception 'transaction_splits.transaction_id must belong to the same household.';
    end if;

    if new.category_id is not null and not exists (
      select 1 from public.budget_categories bc
      where bc.id = new.category_id
        and bc.household_id = new.household_id
    ) then
      raise exception 'transaction_splits.category_id must belong to the same household.';
    end if;
  end if;

  if tg_table_name = 'recurring_payment_instances' then
    if not exists (
      select 1 from public.recurring_payments rp
      where rp.id = new.recurring_payment_id
        and rp.household_id = new.household_id
    ) then
      raise exception 'recurring_payment_instances.recurring_payment_id must belong to the same household.';
    end if;

    if new.transaction_id is not null and not exists (
      select 1 from public.transactions t
      where t.id = new.transaction_id
        and t.household_id = new.household_id
    ) then
      raise exception 'recurring_payment_instances.transaction_id must belong to the same household.';
    end if;
  end if;

  return new;
end;
$$;

notify pgrst, 'reload schema';
