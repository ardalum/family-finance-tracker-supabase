-- Phase 11: recurring payments are tracked as monthly paid/unpaid bill instances.

alter table public.recurring_payment_instances
  add column if not exists paid_date date;

alter table public.recurring_payment_instances
  drop constraint if exists recurring_payment_instances_status_check;

alter table public.recurring_payment_instances
  add constraint recurring_payment_instances_status_check
  check (status in ('generated', 'paid', 'unpaid', 'skipped'));
