# Product Gap Audit

## Scope

This audit reviews WalletFlow as of Phase 7 across these workflows:

- First-time setup
- Account menu, Account Settings, App Settings
- Household Settings
- Dashboard
- Cards (overview, monthly balances, statement details, card list)
- Budget
- Spending (including split transactions)
- Recurring bills
- Insights
- Backup/Restore
- Reset household finance data
- Delete account

## Current App Strengths

- Financial accuracy foundation is strong after Phase 1: statement due-date logic and paid/unpaid handling are centralized and tested.
- Core monthly workflows exist end-to-end: cards, transactions, budgets, recurring, and dashboard rollups.
- Insights now includes lightweight visual reporting foundations and initial YTD review sections using existing data.
- Mobile usability improved in critical areas (especially Monthly Balances and section navigation patterns).
- Primary navigation is focused and clear: Dashboard, Cards, Budget, Spending, Bills, Insights.
- Destructive actions are now clearer and server-side protected via Edge Functions.
- Backup posture is practical for production use: Supabase JSON export/import, Excel export, and validation checks.
- Test coverage is broad across data shaping, sections/navigation consistency, and critical utility logic.

## Current App Weaknesses

- Monthly workflow is distributed across multiple features with no single "close the month" flow.
- Users must remember manual sequencing (cards -> statement details -> recurring -> spending -> budget -> insights -> backup).
- There is no explicit monthly completion marker/status.
- Insight-to-action handoff is weak: Insights are read-only with no guided next steps.
- Some settings remain intentionally deferred (honest now, but still a product gap).
- Backup import is merge-focused and safe, but lacks guided post-import verification checklist in-product.
- Reporting and cash-flow feature expansion currently lacks finalized page-level IA guardrails; without structure, Dashboard/Insights can become cluttered or overlapping.

## Remaining Dead-End UI

- No hard dead-end page was identified in current grouped views.
- Account Settings now resolves correctly and provides actionable sign-out controls.
- Secondary pages (privacy/terms/help/release notes/about) all resolve and render.

## Remaining Misleading Wording Risks

- "Legacy localStorage Backup" section is clearly labeled, but users can still confuse it with Supabase backups if they skim.
- "Review Insights" is conceptually clear, but there is no explicit UX prompt that insights do not mark a month complete.
- App Settings is now honest; no fake working controls remain.

## Missing Features For A Complete Household Finance Tracker

- Monthly close workflow with progress tracking and a final review state.
- Period lock/reopen workflow (soft lock) to reduce accidental back-edits after month review.
- Household activity/audit timeline surfaced in UI for who changed what and when.
- Planned-vs-actual bill forecasting view for upcoming month cash pressure.
- Better uncategorized/categorization triage queue (if uncategorized traffic grows).
- Cross-month carryover helpers for budgets and recurring exceptions.
- Visual analytics and historical reporting (YTD summaries, previous-year comparisons, and trend views for spending/budgets/bills).
- Reporting IA/UX architecture enforcement so Dashboard, Insights, and future Cash Flow remain focused as scope grows.

## Must-Have vs Nice-To-Have

### Must-Have (Next)

- Monthly Close Checklist with auto-detected completion signals and manual confirmations.
- Month reviewed state with clear reopen path.
- Checklist-aware reminders on Dashboard (for incomplete month close items).
- Income, savings, and monthly cash-flow tracking (manual-entry MVP) so households can track inflows, transfers to savings, and surplus/deficit status.
- YTD performance reporting, previous-year comparison, and visual Insights analytics so households can evaluate progress over time.

### Nice-To-Have (Later)

- Forecasting and payment calendar visualization.
- Household activity feed and change history UX.
- Advanced insights drill-down and guided recommendations.
- Soft lock with role-based override controls.

## Recommended Next Feature Priority

**Monthly Close Checklist** should be the next feature.

## Why This Should Come Next

- It stitches together existing strong modules into one reliable month-end workflow.
- It reduces user error from missed steps without changing financial formulas.
- It provides a high-value product layer with relatively low backend risk (can start with existing data and light metadata).
- It improves perceived product completeness more than any isolated page enhancement.

## Risks If This Feature Is Skipped

- Users will continue to miss one or more month-end actions, reducing trust in totals despite correct calculations.
- Support/QA burden rises because issues become workflow gaps, not math bugs.
- Insights remain underutilized without an explicit close process.
- Product may feel "many tools, no workflow" for households doing disciplined monthly reviews.

## Suggested Next Step

- Implement Phase 9 as a **lightweight Monthly Close Checklist MVP** using existing data signals first, manual confirmations second, and no schema change in initial iteration if possible.
