-- Ensure autopay columns exist with UUID account linkage for cards and recurring templates.

alter table public.credit_cards
  add column if not exists autopay_enabled boolean not null default false;

alter table public.recurring_payments
  add column if not exists autopay_enabled boolean not null default false;

alter table public.credit_cards
  add column if not exists autopay_payment_account_id uuid;

alter table public.recurring_payments
  add column if not exists autopay_payment_account_id uuid;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'credit_cards'
      and column_name = 'autopay_payment_account_id'
      and data_type <> 'uuid'
  ) then
    alter table public.credit_cards
      alter column autopay_payment_account_id type uuid
      using nullif(autopay_payment_account_id::text, 'outside_untracked')::uuid;
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'recurring_payments'
      and column_name = 'autopay_payment_account_id'
      and data_type <> 'uuid'
  ) then
    alter table public.recurring_payments
      alter column autopay_payment_account_id type uuid
      using nullif(autopay_payment_account_id::text, 'outside_untracked')::uuid;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'credit_cards_autopay_payment_account_id_fkey'
      and conrelid = 'public.credit_cards'::regclass
  ) then
    alter table public.credit_cards
      add constraint credit_cards_autopay_payment_account_id_fkey
      foreign key (autopay_payment_account_id)
      references public.cash_accounts(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'recurring_payments_autopay_payment_account_id_fkey'
      and conrelid = 'public.recurring_payments'::regclass
  ) then
    alter table public.recurring_payments
      add constraint recurring_payments_autopay_payment_account_id_fkey
      foreign key (autopay_payment_account_id)
      references public.cash_accounts(id)
      on delete set null;
  end if;
end $$;

select pg_notify('pgrst', 'reload schema');