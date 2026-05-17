# Release Readiness Checklist

Use this checklist before each production release.

## 1) Local Verification

- [ ] `npm run verify` passes locally.
- [ ] `npm run dev` is used for any UI behavior check needed in this release.
- [ ] Local branch only contains intended release changes.
- [ ] No secrets are committed (`.env.local`, service keys, or private exports).

## 2) GitHub Actions

- [ ] `verify` workflow passes on the release commit.
- [ ] `Deploy WalletFlow to GitHub Pages` workflow passes.
- [ ] Workflow logs show `npm ci`, `npm run verify`, and build/deploy success.

## 3) GitHub Pages Deployment

- [ ] The latest `main` commit is deployed to `gh-pages`.
- [ ] App loads successfully from the production GitHub Pages URL.
- [ ] Primary nav still shows: Dashboard, Cards, Budget, Spending, Bills, Insights.

## 4) Supabase Migration Checklist

- [ ] `npx supabase link --project-ref <project-ref>` is run for the correct project.
- [ ] `npx supabase db push` is completed for the target environment.
- [ ] `015_monthly_close_reviews.sql` is included and applied.
- [ ] `016_income_tracking.sql` is included and applied.
- [ ] `017_savings_tracking.sql` is included and applied.
- [ ] RLS policies are active for migrated tables.

### Migration mismatch safety

If migration history mismatch occurs (including legacy duplicate migration-number history):

- [ ] Run `npx supabase migration list` first.
- [ ] Compare local migration files to remote migration history.
- [ ] Use Supabase migration repair commands carefully to reconcile status.
- [ ] Re-run `npx supabase db push` after repair.
- [ ] Do **not** use `db reset` for production.

## 5) Supabase Edge Function Checklist

- [ ] Deploy `delete-account` when function code or auth/deletion behavior changes:
      `npx supabase functions deploy delete-account`
- [ ] Deploy `delete-household-finance-data` when deletion flow/copy/behavior changes:
      `npx supabase functions deploy delete-household-finance-data`
- [ ] Confirm both functions exist in the Supabase Dashboard.
- [ ] Confirm required function secrets are present (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, optional `ALLOWED_ORIGINS`).
- [ ] Confirm `SUPABASE_SERVICE_ROLE_KEY` is never exposed in frontend code or Vite env vars.

## 6) Auth Redirect URL Checklist

- [ ] Supabase Auth Site URL is set to production host.
- [ ] Redirect URLs include production callback URL(s).
- [ ] Redirect URLs include local development URL(s) used by the team.
- [ ] Password reset and email confirmation routes are validated.

## 7) Monthly Close Checklist Verification

- [ ] Dashboard Monthly Close Checklist renders for selected month.
- [ ] Auto-detected checks reflect current month data.
- [ ] Manual checks persist by household and month.
- [ ] `Mark month as reviewed` is blocked until required checks are complete.
- [ ] `Reopen month as in progress` works.
- [ ] Switching months loads the correct persisted review state.

## 7b) Income Verification

- [ ] Income page opens from Dashboard quick action and Account menu Tools.
- [ ] Add/edit/delete income source works.
- [ ] Add/edit/delete income entry works.
- [ ] Month switch filters income entries correctly.
- [ ] Monthly income total updates for selected month.
- [ ] Income does not change Spending or Budget totals.

## 7c) Dashboard Cash-Flow Verification

- [ ] Dashboard cash-flow summary renders for selected month.
- [ ] Cash-flow status label is clear (`Positive`, `Negative`, or `Missing income`).
- [ ] Missing-income guidance appears when selected month has no income entries.
- [ ] Estimated leftover uses income, spending, recurring remaining, and savings contribution totals.
- [ ] Cash-flow formula helper text is visible and understandable.
- [ ] Cash-flow limitation note confirms unpaid card balances are excluded in MVP leftover.
- [ ] Cash-flow actions route to Income, Savings, Spending, and Bills workspaces.

## 8) Backup and Export Verification

- [ ] Supabase JSON export works.
- [ ] Excel export works.
- [ ] Import preview + merge flow works with trusted test backup files.
- [ ] Team confirms backups contain sensitive finance data and are stored privately.
- [ ] Supabase JSON export includes `savingsGoals` and `savingsContributions`.
- [ ] Excel export includes `Savings Goals` and `Savings Contributions`.

## 9) Destructive Action Safety

- [ ] Account deletion tested only with test account/test household data.
- [ ] Reset household finance data tested only with disposable test data.
- [ ] Confirmation phrases are required and validated.
- [ ] Delete Account and Reset Household Finance Data wording is clearly distinct.

## 10) Mobile Layout Checklist

- [ ] Cards > Monthly Balances is usable without horizontal table dependence on mobile.
- [ ] Spending filters and transaction actions are usable on mobile.
- [ ] Recurring workspace sections are usable on mobile.
- [ ] Dashboard cards and Monthly Close Checklist are readable on mobile.

## 11) Production Smoke Workflow

- [ ] Execute `docs/production-qa-checklist.md`.
- [ ] Update `docs/production-smoke-test-results.md` with date, environment, pass/fail, and follow-up issues.
- [ ] Capture and store required smoke-test screenshots.
- [ ] Update `docs/bug-backlog.md` statuses for any discovered issues.

## Known Limitations

- Manual production smoke and real-device mobile checks are still required release-by-release.
- Destructive-action validation must remain isolated to test accounts/households.
- Migration history mismatches require careful repair workflow, not production reset.
- Real-data readiness is currently limited by missing native income/savings/cash-flow tracking; releases before that feature is implemented should not claim full household cash-flow completeness.
- Income export is included in Supabase JSON/Excel output, but income merge-import behavior is not yet a complete dedicated workflow with income-specific conflict handling.
- Savings export is included in Supabase JSON/Excel output, but savings merge-import behavior is not yet a complete dedicated workflow with savings-specific conflict handling.
- Dashboard cash-flow MVP estimated leftover intentionally excludes unpaid card balance carry until card-payment cash modeling is explicitly added.
- Full account-balance snapshot and net-worth tracking are not yet implemented; releases should not claim complete household position/net-worth coverage.

## What Not To Test On Real Data

- Account deletion on real user accounts.
- Household finance reset on live household data.
- Backup import experiments using untrusted files.
- Any destructive or merge-heavy workflow without a fresh private backup.
