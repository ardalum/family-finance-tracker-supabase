# Release Notes

## Release Candidate - 2026-05-17 (Phases 48-52)

### Highlights

- Dashboard quick actions were consolidated to a compact set focused on regular monthly updates.
- Calendar MVP is now available as a secondary agenda/list view with month selector.
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
- Account menu Tools section was simplified to keep it shorter and clearer:
  - Financial Position
  - Calendar
  - Backup & Restore
  - App Settings
- Monthly card balance status no longer falsely shows `Checked - No balance` after clearing an entry.
- Numeric amount inputs now support direct typing over default values via focus-select behavior.

### QA and Release Readiness

- Production deployment smoke-test runbooks were added and linked.
- Post-fix production smoke-test results document was added.
- Release/readiness/QA docs were aligned for consistency and regression tracking.

### Notes and limitations

- Many position/reporting flows are manual-entry MVPs (no bank sync/import automation).
- Restore remains merge-safe (add/skip) rather than destructive overwrite mode.
- Final release sign-off still requires deployed manual smoke execution and evidence capture.
- Calendar MVP uses existing WalletFlow data only and does not add reminders, custom events, or external calendar sync.

### Release Handoff

- Phase 53 release-tag/deployment handoff guide: `docs/release-tag-deployment-handoff.md`

### Planned improvements (not in this release)

- Calendar follow-ons: month-grid view, reminders/notifications, custom events, and external sync/export.
