# Product Gap Audit

Last updated: 2026-05-18 (Phase 62 FullCalendar polish)

## Scope

This audit tracks capability gaps after implementation of:

- Dashboard, Cards, Budget, Spending, Bills, Insights
- Monthly Close checklist
- Income, Savings, Accounts, Liabilities, Net Worth
- Financial Position hub
- Backup/export with restore/import validation hardening

## Implemented Capability Status

Implemented (current release scope):

- main-nav financial workflows: Dashboard, Cards, Budget, Spending, Bills, Insights
- monthly close review and reopen workflow
- income and savings manual tracking
- cash accounts and debt/liability snapshot tracking
- net worth summary + trend reporting from manual snapshots
- financial position consolidated hub (secondary view)
- backup/export full-finance coverage and restore validation hardening

## Remaining Product Gaps (Not Bugs)

- no bank sync/aggregation and no automatic account import
- no full overwrite restore mode (merge-safe add/skip only)
- no advanced conflict-resolution UX for restore/import
- no broader non-cash asset coverage (investments, retirement, property)
- no predictive forecasting workflow for upcoming monthly cash pressure
- no recurring income prediction engine for future payday projection in Calendar
- limited guided recommendations in Insights (mostly descriptive analytics)
- Calendar MVP is implemented as a secondary FullCalendar month-grid plus agenda view using existing data; remaining gaps are reminders, external sync/export, and custom events (see `docs/calendar-feature-design.md`)
- Dashboard cash-flow semantics gap: current summary label/model can blur budget spending vs actual cash movement timing (especially card-first usage patterns).
- Navigation IA gap: primary workflows, tools, and account/privacy controls are not yet organized into one clear mental model.
- Data-entry friction gap: no global Quick Add and limited acceleration for repeated monthly entry tasks.
- Insights visualization gap: reporting breadth is good, but chart variety and action-oriented guidance are below expected finance UX standards.
- Privacy/trust polish gap: trust signals and data/privacy controls need tighter, standard account/settings organization and copy tone.

## Release Blockers vs Product Gaps

Release blockers (current):

- none identified from automated verification in this phase

Product gaps (deferred roadmap):

- broader automation and deeper planning/reporting layers listed above
- full UX/IA redesign roadmap from `docs/product-ux-redesign-roadmap.md` (Phases 65-70)

## Future Enhancements (Deferred)

- richer historical drill-down and forecasting across Dashboard/Insights
- stronger post-import in-app guided verification checklist
- optional IA evolution if Financial Position eventually moves to grouped main-nav model
- Calendar follow-on enhancements after FullCalendar polish (reminders/custom events/sync/export)

## Notes

- Keep product gaps separate from defects in `docs/bug-backlog.md`.
- For current release, Financial Position remains secondary by design (see `docs/financial-position-navigation-decision.md`).
- Computed summaries remain intentionally derived from persisted records and are not backed up/restored as standalone persisted datasets.
