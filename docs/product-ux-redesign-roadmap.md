# Product UX Redesign Roadmap

Date: 2026-05-18  
Scope: Planned implementation phases after Phase 64 UX/IA audit

## Phase 65: Dashboard financial model and cash-flow terminology redesign

Status: implemented in Phase 65 (2026-05-18)

- Goal:
  - Make Dashboard summary terminology and logic framing understandable for cash vs card behavior.
- Scope:
  - Rename/reframe cash-flow surfaces.
  - Separate budget/spending usage from near-term cash obligations.
  - Clarify card-payment obligations vs card spending activity.
- Files to inspect:
  - `src/features/dashboard/components/DashboardCashFlowSummary.jsx`
  - `src/features/dashboard/dashboardCashFlow.js`
  - `src/features/dashboard/components/Dashboard.jsx`
  - `src/features/creditCards/*`
  - `src/features/recurring/*`
- What not to change:
  - Supabase schema
  - persisted table model
  - unrelated financial totals outside approved summary semantics
- Tests needed:
  - dashboard cash summary semantics/unit tests
  - copy and status label tests
  - regression tests for existing spending/budget/card totals
- Acceptance criteria:
  - dashboard labels no longer misrepresent card spending as immediate cash outflow
  - summary sections clearly separate cash, obligations, and budget usage
  - verify/test/lint/build pass

## Phase 66: Navigation IA simplification and account menu cleanup

Status: implemented in Phase 66 (2026-05-18)

- Goal:
  - Standardize primary navigation vs tools/settings discovery.
- Scope:
  - Implement approved IA direction (recommended Option A from Phase 64 audit).
  - Introduce or refine More/Tools access pattern.
  - Move account-menu content to compact trust/account-focused structure.
- Files to inspect:
  - `src/components/layout/navigationItems.js`
  - `src/components/layout/Navigation.jsx`
  - `src/features/dashboard/components/Dashboard.jsx`
  - `src/features/auth/components/accountMenuSections.js`
  - `src/app/secondaryViews.js`
  - `src/app/pageContent.js`
- What not to change:
  - main nav item set until explicitly approved
  - Supabase schema
  - financial calculations
- Tests needed:
  - nav integrity tests
  - account menu compactness and target-mapping tests
  - hash/back-forward navigation tests
- Acceptance criteria:
  - navigation model is coherent and documented
  - account menu is compact and trust-oriented
  - daily tools remain discoverable without menu clutter

## Phase 68: Frictionless data entry / Quick Add MVP

Status: implemented as MVP in Phase 68 (2026-05-18)

- Goal:
  - Reduce taps/clicks for frequent entries, especially transactions.
- Scope:
  - Add global Quick Add entry.
  - Add quick-add transaction modal.
  - Add recent merchant/category shortcuts.
  - Defer duplicate-last-transaction support to a follow-up.
- Files to inspect:
  - `src/features/spending/components/*`
  - `src/features/income/components/*`
  - `src/features/recurring/components/*`
  - `src/components/layout/*`
  - `src/app/App.jsx`
- What not to change:
  - Supabase schema
  - core accounting formulas
  - unrelated IA structure outside approved phase scope
- Tests needed:
  - quick-add open/submit/cancel flows
  - keyboard/mobile entry behavior
  - regression tests for existing create/edit/delete paths
- Acceptance criteria:
  - common transaction can be logged significantly faster
  - mobile tap targets and keyboard flow remain strong
  - no regressions in existing entry workflows

## Phase 69: Insights visual analytics redesign with standard charts

- Goal:
  - Improve scanability and actionable reporting through standard finance visual patterns.
- Scope:
  - Add chart variety using existing `recharts` dependency only.
  - Introduce actionable insight cards and warning surfaces.
  - Preserve existing metric correctness.
- Files to inspect:
  - `src/features/insights/components/Insights.jsx`
  - `src/features/insights/insightsChartData.js`
  - `src/features/insights/insightsYtdUtils.js`
  - `src/features/insights/insightsYearComparisonUtils.js`
- What not to change:
  - new chart libraries
  - financial calculations
  - Supabase schema
- Tests needed:
  - chart-data helper tests
  - actionable-card logic tests
  - empty-state and missing-data tests
- Acceptance criteria:
  - insights includes trend, composition, and comparison chart types
  - users can identify next actions from insights cards
  - all existing insights math remains consistent

## Phase 70: Privacy and trust polish

- Goal:
  - Increase user confidence via clearer data/privacy and account safety experiences.
- Scope:
  - tighten trust copy
  - consolidate privacy/data controls narrative
  - polish destructive-action guidance
- Files to inspect:
  - `src/features/auth/components/*`
  - `src/features/backup/components/*`
  - `src/features/legal/components/*`
  - `src/app/pageContent.js`
- What not to change:
  - backend security model
  - auth provider behavior
  - schema
- Tests needed:
  - trust-copy and menu-presence tests
  - destructive-flow wording consistency tests
  - regression checks for deletion/export entry points
- Acceptance criteria:
  - trust and privacy surfaces feel consistent and professional
  - users can find export/delete/privacy controls quickly
  - no routing/regression issues

## Phase 71: Final release candidate retest

- Goal:
  - Validate the post-redesign experience and declare RC readiness.
- Scope:
  - full regression run
  - manual browser + mobile smoke
  - release docs final sync
- Files to inspect:
  - `docs/release-readiness-checklist.md`
  - `docs/production-qa-checklist.md`
  - `docs/release-notes.md`
  - all touched feature surfaces from phases 65-69
- What not to change:
  - scope creep into new major features
  - schema/calc changes outside approved fixes
- Tests needed:
  - full `npm run verify`
  - targeted UX interaction tests added in phases 65-69
  - manual smoke evidence docs updates
- Acceptance criteria:
  - no critical/high blockers remain
  - UX/IA findings from Phase 64 are resolved or consciously deferred
  - release documents support a clear Go decision
