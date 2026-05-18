# Product Gap Audit

Last updated: 2026-05-18 (Phase 72 liability confirmation/label polish)

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
- Dashboard cash-flow semantics gap: addressed in Phase 65 with Financial Pulse summary wording and separated budget/cash/obligation groups.
- Navigation IA gap: addressed for release scope in Phase 70 with true sidebar/drawer navigation and grouped direct access to Money Setup workflows.
- Data-entry friction gap: partially addressed in Phase 68 with global Quick Add transaction MVP; broader multi-entity quick entry and richer repeat-entry acceleration remain open.
- Insights visualization gap: partially addressed in Phase 69 with varied chart types and actionable cards; deeper predictive guidance and automated recommendations remain open.
- Privacy/trust polish gap: addressed for release scope in Phase 70 with clearer privacy/data handling copy, explicit backup/restore warnings, and stronger destructive-action wording. Additional visual/security UX depth remains future scope.
- Liabilities review clarity gap: addressed in Phases 71-72 with month-level "No liabilities confirmed" prompt/status behavior and false-warning suppression across Liabilities, Net Worth, Financial Position, Monthly Close, and Insights copy.
- Display-label professionalism gap: addressed in Phases 71-72 by centralizing enum/internal value humanization coverage for cash account and liability types without changing stored values.
- Insights composition readability gap: addressed in Phase 71 with overflow-safe layout plus conditional scrolling so normal category counts do not force unnecessary internal scroll.

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
