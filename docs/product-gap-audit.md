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
- Insights now includes an initial year-over-year comparison layer for same-month and same-period YTD checks.
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

## Phase 23 Status Update

- Income tracking is now **partially addressed** via manual Income Sources + Income Entries (no bank sync/imports).
- Savings tracking and monthly cash-flow summary cards are still open product gaps.

## Phase 25 Status Update

- Savings tracking is now **partially addressed** via manual Savings Goals + Savings Contributions (no bank sync/imports).
- Savings progress tracking is available via goal progress cards, but cash-flow summaries and emergency-fund specific guidance remain open scope.
- Income + savings import automation, net cash-flow summary cards, and forecasting remain product gaps.

## Phase 27 Status Update

- Dashboard cash-flow summary is now **partially addressed** with a compact monthly card for income, spending, savings contributions, recurring remaining, and estimated leftover.
- Current cash-flow MVP intentionally excludes unpaid card balance carry from the leftover formula until card payment cash modeling is explicitly defined.
- Remaining gaps: emergency-fund specific workflow, fuller cash-balance modeling, and forecasting.

## Phase 29 Status Update

- Account balance snapshots and net worth tracking are now explicitly documented as a remaining product gap in `docs/account-balances-net-worth-design.md`.
- WalletFlow still lacks manual account/liability snapshot workflows for true household position tracking (assets vs liabilities).
- Net worth and liquid-cash trends remain open scope pending snapshot data model + MVP implementation.

## Phase 30 Status Update

- Cash account snapshots are now **partially addressed** with manual cash accounts, monthly/date snapshots, and an Accounts workspace entry point.
- Remaining product gaps for this pillar:
  - liability/debt snapshots
  - full net worth summary
  - net worth/liquid-cash trend reporting

## Phase 32 Status Update

- Liability/debt snapshots are now documented as the next remaining implementation gap in `docs/liability-debt-snapshots-design.md`.
- Product remains intentionally incomplete for household position tracking until liability snapshots and net-worth summary layers are implemented.

## Phase 33 Status Update

- Liability/debt snapshots are now **partially addressed** with manual liability accounts and monthly debt balance snapshots.
- Remaining product gaps for household position:
  - net worth summary layer
  - net worth and debt trend reporting
  - broader asset/liability scope beyond current manual cash/debt snapshots

## Phase 35 Status Update

- Net worth summary is now **partially addressed** with a manual snapshot-based MVP (`assets - liabilities`) using existing cash account and liability snapshots.
- Remaining product gaps for this pillar:
  - net worth trends and historical reporting
  - broader asset coverage (home/retirement/investments)
  - deeper debt analytics and automation

## Phase 39 Status Update

- A full post-expansion UX audit is now documented in `docs/product-ux-audit-after-finance-expansion.md`.
- Primary risk has shifted from missing core modules to UX architecture pressure as scope expands.
- Current risk focus:
  - secondary-tool discoverability for Income/Savings/Accounts/Liabilities/Net Worth
  - Dashboard quick-action density and long-scroll fatigue
  - Insights section length and reporting scanability
  - terminology drift across Cards/Bills/Accounts/Liabilities/Net Worth labels
