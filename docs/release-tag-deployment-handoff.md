# Release Tag and Deployment Handoff (Phase 53)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker

## 1) Release candidate status

- Release candidate documentation is complete through Phase 52.
- Phase 50 critical UX/navigation/input fixes are implemented and regression-tested in automation.
- Automated quality gate is passing (`npm run verify`).
- Remaining risk is manual deployed-app smoke evidence capture.

## 2) Recommended release tag name

- `v0.1.0-rc.1`

Rationale:

- `package.json` version is `0.1.0`.
- This tag marks a release-candidate snapshot without changing the app/package version.

## 3) What is included in the release

- Main navigation workflows: Dashboard, Cards, Budget, Spending, Bills, Insights.
- Secondary workflows: Financial Position, Income, Savings, Accounts, Liabilities, Net Worth.
- Monthly Close review/reopen workflow.
- Backup/export coverage for full persisted finance sections.
- Restore/import validation hardening (merge-safe behavior).
- Hash-based browser Back/Forward support between app views.
- Account menu simplification and numeric input UX improvements.

## 4) What is intentionally excluded

- No bank sync/import automation.
- No destructive overwrite restore mode.
- No broader non-cash asset automation (investments/property/retirement).
- No major navigation restructuring beyond implemented compact menu/tooling.
- No new major product workflows.

## 5) Verification commands

Run locally before tagging:

```bash
npm run format:check
npm run build
npm run test:run
npm run lint
npm run verify
```

## 6) GitHub Pages deployment assumptions

- Deployment target is GitHub Pages (`gh-pages`) via `.github/workflows/deploy.yml`.
- Vite base path is expected to remain `/family-finance-tracker-supabase/`.
- Deploy workflow runs `npm run verify` before publish.
- Deploy publishes `dist/` and verifies output does not reference `/src/main.jsx`.

## 7) Supabase project dependencies

- Supabase Auth configured for production URL + redirects.
- RLS-enabled finance tables for cards/budgets/spending/recurring/monthly close/income/savings/accounts/liabilities.
- Household setup/profile/security migrations already present.

## 8) Required migrations already applied

At minimum, confirm these are applied in the target project:

- `015_monthly_close_reviews.sql`
- `016_income_tracking.sql`
- `017_savings_tracking.sql`
- `018_cash_account_snapshots.sql`
- `019_liability_debt_snapshots.sql`

## 9) Required edge functions deployed

- `delete-account`
- `delete-household-finance-data`

If function code changed, redeploy before release cutover.

## 10) Required environment variables

Frontend (GitHub Actions/deploy runtime):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Edge function secrets (server-side only):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGINS` (recommended)

Security note: never expose `SUPABASE_SERVICE_ROLE_KEY` in frontend env vars or source.

## 11) Manual pre-tag checklist

- [ ] Confirm `main` contains only intended release changes.
- [ ] Confirm `npm run verify` passes on release candidate commit.
- [ ] Confirm release docs are updated:
  - `docs/release-notes.md`
  - `docs/release-readiness-checklist.md`
  - `docs/release-readiness-production-qa-pass.md`
  - `docs/production-deployment-smoke-test.md`
  - `docs/post-fix-production-smoke-test-results.md`
- [ ] Confirm no new critical/high open bugs in `docs/bug-backlog.md`.
- [ ] Confirm product gaps are tracked separately in `docs/product-gap-audit.md`.
- [ ] Create annotated tag: `v0.1.0-rc.1`.

## 12) Manual post-deploy checklist

- [ ] Deploy workflow succeeds on tagged commit.
- [ ] Deployed app loads from GitHub Pages URL.
- [ ] Auth/session flow works.
- [ ] Main nav remains: Dashboard, Cards, Budget, Spending, Bills, Insights.
- [ ] Dashboard quick actions work; Financial Position opens.
- [ ] Cards/Budget/Spending/Bills/Insights workflows open and function.
- [ ] Financial Position links to Income/Savings/Accounts/Liabilities/Net Worth/Insights.
- [ ] Monthly Close review/reopen works.
- [ ] Backup export works (JSON + Excel).
- [ ] Restore validation rejects invalid JSON safely.
- [ ] Browser Back/Forward navigation works between views.
- [ ] Mobile width has no obvious horizontal scrolling on key pages.
- [ ] No critical console errors or Supabase missing-table errors.

## 13) Rollback notes

- If deployment regression is found, roll back by redeploying the previous known-good commit/tag to `main` and allowing GitHub Pages workflow to republish `gh-pages`.
- Re-check required env vars and migration state before reattempting release.
- Do not run destructive restore/reset steps in production during rollback validation.

## 14) Known limitations

- Deployed manual smoke evidence capture is still required per release.
- Cross-device mobile verification remains a manual step.
- Restore/import remains merge-safe add/skip (not overwrite mode).
- Many finance position/reporting flows remain manual-entry MVP workflows.

## 15) Go/No-Go decision

- **Current recommendation: Conditional Go**
  - Go for tag/deploy once manual pre-tag checklist is complete and deployed smoke evidence is recorded.
  - No-Go if deployed smoke reveals critical auth/data/navigation regressions.
