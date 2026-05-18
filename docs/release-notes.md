# Release Notes

## Release Candidate - 2026-05-18 (Phases 48-63)

### Highlights

- Dashboard quick actions were consolidated to a compact set focused on regular monthly updates.
- Calendar now uses a FullCalendar month-grid view as the default secondary workspace, with Agenda list available as a secondary toggle.
- Calendar hardening pass improved event-accuracy QA behavior (month-end close marker, duplicate-event safety, and selected-day/filter polish).
- Calendar keeps Dashboard/account-menu entry points while preserving existing WalletFlow event-source behavior.
- Calendar FullCalendar mobile polish pass improved small-width event density and control usability.
- Financial Position hub is implemented as the main secondary entry point for income, savings, cash accounts, liabilities, and net worth review.
- Income tracking is available with manual income sources and income entries.
- Savings tracking is available with manual goals and contributions.
- Cash account tracking is available with manual account and balance snapshots.
- Liability/debt tracking is available with manual liability accounts and snapshots.
- Net Worth summary is available from snapshot data.
- Net Worth trends are available in Insights from snapshot data.

### Backup/Restore and Data Safety

- Backup/export coverage now includes full persisted finance sections (JSON + Excel).
- Restore/import validation was hardened (invalid JSON rejection, empty backup rejection, unknown/computed section warnings, safe shape checks).
- Computed summaries remain derived and are intentionally not restored as standalone persisted rows.

### UX and Navigation Fixes

- Browser Back/Forward now works between app views using hash-based URLs.
- Account menu was simplified to keep it shorter and account/trust focused (Account Settings, Household Settings, Privacy & Data, Support links), while secondary workflows moved to the Tools workspace.
- Monthly card balance status no longer falsely shows `Checked - No balance` after clearing an entry.
- Numeric amount inputs now support direct typing over default values via focus-select behavior.
- Dashboard summary was reframed from cash-flow leftover wording to a clearer Financial Pulse model:
  - cash position from account snapshots
  - spending/budget usage
  - upcoming obligations (recurring + unpaid cards)
  - savings shown separately
  - planned cash cushion labeled as a planning estimate
- Navigation was simplified with a dedicated Tools workspace for secondary workflows, while keeping main nav unchanged.
- Account menu was cleaned up to focus on account, household, privacy/data, and support (daily planning tools moved out of account menu).
- Quick Add transaction MVP now provides a global, faster amount-first modal flow with recent-merchant shortcuts and existing spending-save logic reuse.
- Insights visual analytics were redesigned with varied Recharts-based visuals (donut composition, monthly trend, budget-vs-actual comparison, and net-worth trend) plus actionable insight cards.
- Privacy/trust surfaces were polished with clearer Data & Privacy guidance, stronger Backup/Restore import safety warnings, explicit destructive-action wording, and improved Security & session clarity in Account Settings.
- App shell now uses true sidebar navigation on desktop/tablet and a hamburger drawer on mobile, with grouped Main/Planning/Money Setup/System sections.
- Money Setup workflows (Income, Savings, Accounts, Liabilities) are now directly reachable from sidebar/drawer without relying on Dashboard Tools.
- Sidebar groups are now collapsible to reduce clutter, with Main expanded by default and automatic expansion for the active view's group.
- Liabilities no-review UX was stabilized with clear month-level confirmation messaging and suppression of false missing-liability warnings.
- Account/liability enum labels received additional professional display-label hardening without changing stored values.
- Insights Spending Composition now avoids unnecessary internal scrolling for normal category counts while preserving safe overflow handling for dense category sets.
- Insights Spending Composition layout now centers the donut chart with category ranking below, using balanced two-column ranking on desktop and single-column stacking on mobile.
- Liabilities now include month-level `Confirm no liabilities` / `Reset liability review` controls to suppress false missing-liability warnings when appropriate.
- Account/liability/net-worth enum labels now render with professional display casing (for example `checking` -> `Checking`) without changing stored values.
- Insights Spending Composition layout was hardened to avoid card overflow and now surfaces percentage context in composition details.

### QA and Release Readiness

- Production deployment smoke-test runbooks were added and linked.
- Post-fix production smoke-test results document was added.
- Release/readiness/QA docs were aligned for consistency and regression tracking.
- Phase 64 full-product UX/IA audit identified release-blocking semantics/IA decisions that must be triaged before final RC tagging.

### Notes and limitations

- Many position/reporting flows are manual-entry MVPs (no bank sync/import automation).
- Restore remains merge-safe (add/skip) rather than destructive overwrite mode.
- Final release sign-off still requires deployed manual smoke execution and evidence capture.
- Calendar event sources in this release are existing WalletFlow data only:
  - card due dates
  - statement close dates
  - recurring bills
  - income entries
  - monthly close marker
- Calendar limitations remain:
  - no custom calendar events
  - no reminders/notifications
  - no Google/Apple calendar sync/export

### Release Handoff

- Final RC release-tag/deployment handoff guide: `docs/release-tag-deployment-handoff.md`

### Planned improvements (not in this release)

- Calendar follow-ons: reminders/notifications, custom events, and external sync/export.
- UX/IA roadmap phases 65-70: dashboard cash-flow semantics redesign, navigation/account-menu IA cleanup, quick-add entry acceleration, Insights chart modernization, and trust-surface polish.
