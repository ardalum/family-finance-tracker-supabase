# Production Deployment Smoke Test (Phase 49)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker

## 1) Deployment target

- Primary target: GitHub Pages (`gh-pages` branch) via `.github/workflows/deploy.yml`
- Expected app base path: `/family-finance-tracker-supabase/`

## 2) Build command

- `npm run build`

## 3) Verification command

- `npm run verify`

## 4) GitHub Pages or hosting notes

- Vite `base` is configured in `vite.config.js` as `/family-finance-tracker-supabase/` for GitHub Pages.
- Deploy workflow runs verify before publish and checks `dist/index.html` does not reference `/src/main.jsx`.
- Deployment publishes `./dist` to `gh-pages` using `peaceiris/actions-gh-pages@v3`.

## 5) Supabase project dependency notes

- App requires a Supabase project with required finance tables and RLS policies already applied.
- Auth/session workflows depend on Supabase Auth routes and redirect URL configuration.
- Backup/restore, household data reset, and account delete flows depend on configured Supabase project and edge functions.

## 6) Required environment variables

Frontend (build/runtime):

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Workflow/deploy:

- GitHub Actions secrets `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are required for `npm run verify` in deploy workflow.

Notes:

- `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to frontend code.
- Service-role usage stays server-side in Supabase edge functions only.

## 7) Required Supabase migrations already applied

Expected migration set includes at minimum:

- `015_monthly_close_reviews.sql`
- `016_income_tracking.sql`
- `017_savings_tracking.sql`
- `018_cash_account_snapshots.sql`
- `019_liability_debt_snapshots.sql`

## 8) Edge functions that must be deployed, if applicable

- `delete-account`
- `delete-household-finance-data`

Both are required for destructive-account/household safety flows used by Backup & Restore / Danger Zone UI.

## 9) Manual smoke-test checklist

Run on deployed app with test account + test household:

- [ ] Deployed app loads without blank screen.
- [ ] Login/auth flows succeed (sign in, session load, sign out).
- [ ] Dashboard opens and quick actions route correctly.
- [ ] Cards, Budget, Spending, Bills, Insights open successfully.
- [ ] Financial Position, Income, Savings, Accounts, Liabilities, Net Worth open successfully.
- [ ] Monthly Close checklist render/review/reopen flows work.
- [ ] Backup export works (JSON + Excel).
- [ ] Restore validation rejects invalid JSON with clear message.
- [ ] Account menu opens and Settings pages are reachable (no dead ends).
- [ ] Mobile-width checks show no obvious horizontal scrolling on key pages.
- [ ] Browser console has no critical runtime errors.
- [ ] No Supabase missing-table errors appear.

## 10) Known deployment risks

- Manual deployed-environment smoke evidence is still required each release.
- Cross-device iOS/Android verification can reveal issues not seen in local desktop testing.
- Incorrect GitHub Pages secret configuration for Supabase env vars will break auth/data load.
- Migration mismatch across environments can surface as missing-table/column runtime errors.
- Restore is intentionally merge-safe (add/skip) and not destructive overwrite; expectations must be clear during smoke.

## 11) Go/no-go recommendation

- **Go** when: workflow verify/deploy pass, deployed smoke checklist passes, and no critical runtime or data-access errors are found.
- **No-go** when: deployed app fails to load, auth/data queries fail from env or migration misconfiguration, or critical workflow routing/regression is observed.

## Phase 50 follow-up issues discovered

- Account menu length was too long for production UX standards (fixed in Phase 50 by compact Tools entries).
- Browser back/forward did not work across app views due to state-only navigation (fixed in Phase 50 with hash-backed navigation).
- Monthly balance `Checked · No balance` could be triggered after balance clear without explicit intent (reopened after Phase 50 and corrected in Phase 54).
- Numeric amount fields with default `0` needed manual clearing before typing (fixed in Phase 50 with focus-select behavior).

## Phase 51 post-fix retest reference

- Post-fix production retest log: `docs/post-fix-production-smoke-test-results.md`
