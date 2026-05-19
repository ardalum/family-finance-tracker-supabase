-- Make source-event dedupe compatible with Supabase upsert onConflict.
-- PostgreSQL unique indexes allow multiple null values, so source-less manual
-- adjustments can still coexist while source-linked movements dedupe safely.

drop index if exists public.account_money_movements_source_unique_idx;

create unique index if not exists account_money_movements_source_unique_idx
  on public.account_money_movements (household_id, source_type, source_id);

select pg_notify('pgrst', 'reload schema');
