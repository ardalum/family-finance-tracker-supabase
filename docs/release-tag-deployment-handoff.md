# Release Tag and Deployment Handoff (Phase 63)

Date: 2026-05-18  
Project: WalletFlow / Family Finance Tracker

## 1) Release candidate status

- Release candidate documentation is complete through Phase 75.
- FullCalendar, Dashboard Financial Pulse, grouped sidebar navigation, Quick Add, Insights visual analytics, privacy/trust polish, liabilities/no-liability review, professional labels, past-due card debt sync, liability carry-forward, debt-delete modal, and mobile responsiveness stabilization are implemented.
- Automated quality gate is passing (`npm run verify`) with `481` tests.
- Remaining risk is manual deployed-app smoke evidence capture and real mobile/browser validation.

## 2) Recommended release tag name

- `v0.1.0-rc.1`

Rationale:

- `package.json` version is `0.1.0`.
- This tag marks a release-candidate snapshot without changing the app/package version.

## 3) What is included in the release

- Main navigation workflows: Dashboard, Cards, Budget, Spending, Bills, Insights.
- Secondary workflows: Financial Position, Income, Savings, Accounts, Liabilities, Net Worth.
- Calendar secondary workspace powered by FullCalendar month grid + agenda toggle.
- Monthly Close review/reopen workflow.
- Backup/export coverage for full persisted finance sections.
- Restore/import validation hardening (merge-safe behavior).
- Hash-based browser Back/Forward support between app views.
- Account menu simplification and numeric input UX improvements.
- Dashboard Financial Pulse summary semantics.
- Quick Add transaction MVP.
- Grouped desktop sidebar and mobile drawer navigation.
- Dashboard and Tools Calendar discoverability entry points.
- Past-due unpaid credit card debt auto-sync into linked liabilities.
- Liability carry-forward into Net Worth/Financial Position.
- Mobile app shell, Credit Cards, and Recurring/Bills overflow stabilization.

## 4) What is intentionally excluded

- No bank sync/import automation.
- No destructive overwrite restore mode.
- No broader non-cash asset automation (investments/property/retirement).
- No major navigation restructuring beyond implemented compact menu/tooling.
- No new major product workflows.
- No custom calendar events/reminders/external calendar sync.
- No FullCalendar premium plugins.

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
- No dedicated calendar persistence table is used; calendar events are derived from existing WalletFlow records.

## 7b) FullCalendar dependency notes

- Expected Calendar dependencies:
  - `@fullcalendar/core`
  - `@fullcalendar/react`
  - `@fullcalendar/daygrid`
  - `@fullcalendar/interaction`
- No premium FullCalendar plugins are included in this release candidate.

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
- [ ] Confirm Phase 75 automated retest results are reflected in `docs/release-readiness-production-qa-pass.md`.
- [ ] Confirm release docs are updated:
  - `docs/release-notes.md`
  - `docs/release-readiness-checklist.md`
  - `docs/release-readiness-production-qa-pass.md`
  - `docs/production-deployment-smoke-test.md`
  - `docs/post-fix-production-smoke-test-results.md`
- [ ] Confirm no new critical/high open bugs in `docs/bug-backlog.md`.
- [ ] Confirm product gaps are tracked separately in `docs/product-gap-audit.md`.
- [ ] Confirm stale PR #338 is treated as obsolete after FullCalendar migration and is closed/ignored (do not merge).
- [ ] Create annotated tag: `v0.1.0-rc.1`.

## 12) Manual post-deploy checklist

- [ ] Deploy workflow succeeds on tagged commit.
- [ ] Deployed app loads from GitHub Pages URL.
- [ ] Auth/session flow works.
- [ ] Main nav remains: Dashboard, Cards, Budget, Spending, Bills, Insights.
- [ ] Dashboard quick actions work; Financial Position opens.
- [ ] Calendar opens from Dashboard quick action and Account menu Tools.
- [ ] FullCalendar month grid appears first and remains usable on mobile widths.
- [ ] Calendar event actions route to Cards/Bills/Income/Dashboard correctly.
- [ ] Cards/Budget/Spending/Bills/Insights workflows open and function.
- [ ] Financial Position links to Income/Savings/Accounts/Liabilities/Net Worth/Insights.
- [ ] Monthly Close review/reopen works.
- [ ] Backup export works (JSON + Excel).
- [ ] Restore validation rejects invalid JSON safely.
- [ ] Browser Back/Forward navigation works between views.
- [ ] Mobile width has no obvious horizontal scrolling on key pages.
- [ ] Mobile widths 360px, 375px, 390px, and 414px show compact header, unclipped branding, one Quick Add entry, and no page-level horizontal scroll on Dashboard/Cards/Bills/Insights/Calendar/Financial Position.
- [ ] No critical console errors or Supabase missing-table errors.
- [ ] Calendar has no horizontal scrolling on common mobile widths (360px and 390px).

## 13) Rollback notes

- If deployment regression is found, roll back by redeploying the previous known-good commit/tag to `main` and allowing GitHub Pages workflow to republish `gh-pages`.
- Re-check required env vars and migration state before reattempting release.
- Do not run destructive restore/reset steps in production during rollback validation.

## 14) Known limitations

- Deployed manual smoke evidence capture is still required per release.
- Cross-device mobile verification remains a manual step.
- Restore/import remains merge-safe add/skip (not overwrite mode).
- Many finance position/reporting flows remain manual-entry MVP workflows.
- Calendar remains existing-data-only with no custom events, reminders, or external sync/export.
- Stale PR #338 predates the FullCalendar migration and should not be merged into this RC.

## 15) Go/No-Go decision

- **Current recommendation: Conditional Go for RC tagging**
  - Local automated retest is clean and no code-level critical/high blockers are open.
  - Go for production release only once manual pre-tag checklist, deployed smoke evidence, and mobile viewport/device checks are recorded.
  - No-Go if deployed smoke reveals critical auth/data/navigation/mobile regressions.

## 16) Phase 76 release tag handoff closure

Phase 76 status on 2026-05-18:

- Local automated gates passed:
  - `npm run format:check`
  - `npm run build`
  - `npm run test:run` (`481` tests, `0` failures)
  - `npm run lint`
  - `npm run verify`
- PR #354 mobile/regression checklist items are now explicitly tracked as either automated/source-covered or requiring browser/manual verification.
- No code-level critical/high release blockers are open from this local pass.

Recommended release title:

- `WalletFlow v0.1.0 RC1 - Family finance tracker release candidate`

Recommended tag:

- `v0.1.0-rc.1`

Recommended release summary:

- Dashboard Financial Pulse, grouped sidebar/mobile drawer navigation, Quick Add transaction MVP, FullCalendar Calendar, Insights visual analytics, privacy/trust polish, no-liability confirmation, professional labels, past-due card debt sync, liability carry-forward, debt-delete modal confirmation, and mobile responsiveness stabilization.

Pre-tag requirements:

- Confirm the working tree contains only intended release documentation/code changes.
- Confirm GitHub Actions `Verify` is passing on the candidate commit.
- Complete or explicitly accept pending browser/manual smoke items from Phase 76.
- Confirm stale PR #338 is closed or ignored and is not merged into the RC.

Suggested tag commands (do not run until the candidate commit is final):

```bash
git status
git tag -a v0.1.0-rc.1 -m "WalletFlow v0.1.0 RC1"
git push origin v0.1.0-rc.1
```

Post-tag smoke requirements:

- Deploy workflow succeeds from the tagged/main release commit.
- Deployed app loads on GitHub Pages with production Supabase env vars.
- Mobile browser matrix at 360px, 375px, 390px, and 414px confirms no header/page-level horizontal overflow.
- Sidebar drawer, Quick Add, Credit Cards, Recurring/Bills, Insights, Liabilities, Net Worth, and Financial Position remain usable on mobile.
- Browser console has no critical runtime errors.

Phase 76 go/no-go recommendation:

- **Conditional Go for RC tag handoff** from local automation.
- **No-Go for final production release** until manual browser/mobile/deployed smoke evidence is recorded.
