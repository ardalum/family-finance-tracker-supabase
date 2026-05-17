# Real-Data Readiness Checklist

Use this checklist before entering or validating real household data.

## 1) Safety First

- [ ] Use a test household and test account first.
- [ ] Confirm destructive actions are tested only with disposable test data.
- [ ] Export a fresh backup before any risky validation step.
- [ ] Do not run destructive actions on real data as part of first-pass validation.

## 2) Deployment Readiness

- [ ] GitHub Pages deploy workflow passed for the target release commit.
- [ ] `npm run verify` passed for the release commit.
- [ ] Production GitHub Pages app loads without console-breaking errors.

## 3) Supabase Readiness

- [ ] `npx supabase db push` has been run for the target environment.
- [ ] `public.monthly_close_reviews` exists in Supabase (from `015_monthly_close_reviews.sql`).
- [ ] RLS policies for monthly close reviews are active.

## 4) Edge Function Readiness

- [ ] `delete-account` is deployed:
      `npx supabase functions deploy delete-account`
- [ ] `delete-household-finance-data` is deployed:
      `npx supabase functions deploy delete-household-finance-data`
- [ ] Both functions are visible in Supabase Dashboard.
- [ ] Function secrets are configured (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, optional `ALLOWED_ORIGINS`).

## 5) Auth Redirect Readiness

- [ ] Supabase Auth site URL points to the production host.
- [ ] Production redirect URLs are configured.
- [ ] Local redirect URLs needed by maintainers are configured.
- [ ] Password reset and email confirmation redirects are validated.

## 6) Core Workflow Checks Before Real Use

### Cards workflow

- [ ] Add/edit/deactivate/delete card behavior is correct.
- [ ] Monthly Balances desktop and mobile flows are usable.
- [ ] Statement details save and reflect expected status behavior.

### Budget workflow

- [ ] Budget category add/edit/delete is stable.
- [ ] Copy previous month and default budgets work as expected.

### Spending workflow

- [ ] Add/edit/delete transaction works.
- [ ] Split transaction validation blocks invalid totals.
- [ ] Filters and sorting operate correctly.

### Bills workflow

- [ ] Recurring templates and This Month statuses work.
- [ ] Mark paid/unpaid/skip paths are usable.

### Monthly Close Checklist workflow

- [ ] Checklist renders for selected month.
- [ ] Auto-detected checks update from current data.
- [ ] Manual checks persist by household and month.
- [ ] Mark reviewed/reopen behavior works.

### Backup/Restore workflow

- [ ] Supabase JSON export works.
- [ ] Excel export works.
- [ ] Import preview + merge works with trusted files only.

## 7) Mobile Layout Validation

- [ ] Dashboard and Monthly Close Checklist are readable on mobile.
- [ ] Cards > Monthly Balances mobile cards are usable.
- [ ] Spending and Bills core actions are reachable on mobile.

## 8) Known Limitations Before Real Use

- Manual production smoke evidence and screenshots must still be captured release-by-release.
- Cross-device (iOS/Android) validation is still required before broad real-data rollout.
- Destructive actions are intentionally protected and should remain test-data-only during pre-release validation.

## 9) Migration Mismatch Workaround (Manual)

If migration history mismatch occurs:

1. Run `npx supabase migration list`.
2. Compare local migration files and remote history carefully.
3. Use Supabase migration repair commands only as needed.
4. Re-run `npx supabase db push`.
5. Do not run `db reset` in production.

## 10) Rollback / Recovery Guidance

- Keep recent private backups before each release candidate validation cycle.
- If release behavior regresses, pause real-data usage and restore from known-good backups in test-first mode.
- Revert the deploy to the previous known-good commit and redeploy.
- Re-run `npm run verify`, targeted smoke checks, and critical destructive-flow checks on test data before resuming real-data operations.
