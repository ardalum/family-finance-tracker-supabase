# Production UX Bug Audit (Phase 50)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Source: production smoke-test findings + targeted code audit

## 1) Issues found during deployed-app smoke testing

### Critical

- Browser back/forward did not navigate between app views (state-only navigation).

### High

- Account menu Tools section was too long and overloaded with many detailed finance entries.
- Monthly card balance status could show `Checked � No balance` after clearing/deleting balance input without explicit user intent.
- Numeric amount inputs with default `0` often required manual clearing before typing.

### Medium

- Terminology and copy consistency issues in a few labels/messages (minor wording/encoding defects).

### Low

- Deeper device-specific mobile ergonomics still require cross-device manual verification.

### UX backlog

- Future IA improvements for large secondary-tool surface area (beyond compact account-menu simplification in this phase).

## 2) Affected pages

- Header account menu (all pages)
- Navigation and view switching across main and secondary views
- Cards > Monthly Balances (desktop and mobile)
- Numeric inputs across Cards, Budget, Spending, Bills, Income, Savings, Accounts, Liabilities

## 3) Root cause summary

- Navigation state was persisted only via React state + localStorage without URL history integration.
- Account menu exposed both hub and every detailed finance tool directly, increasing length and scannability cost.
- Zero-balance status logic treated any saved non-positive entry as intentional checked-no-balance.
- Numeric input focus behavior did not optimize overwrite flow for default `0` values.

## 4) Fix applied or deferred

### Fixed in Phase 50

- Added hash-based URL-backed view synchronization (`#/...`) with safe fallback behavior.
- Added browser back/forward support via hashchange-driven active view updates.
- Simplified account menu Tools to compact entries:
  - Financial Position
  - Backup & Restore
  - App Settings
- Kept detailed finance pages accessible through Financial Position (not deleted).
- Fixed monthly balance status logic:
  - `no entry` => `Not checked`
  - `balance <= 0 && paid` => `Checked � No balance`
  - `balance <= 0 && not paid` => `Not checked`
- Clearing monthly balance input now removes the saved entry instead of persisting implicit zero-checked state.
- Added numeric input focus-select behavior for `type="number"` in shared input component and monthly balance inputs.

### Deferred

- Broader IA redesign for secondary tools beyond compact account-menu cleanup.
- Full cross-device UX polish pass beyond critical/high blockers.

## 5) Manual retest steps

1. Open account menu and confirm Tools section is compact (Financial Position, Backup & Restore, App Settings only).
2. From Dashboard, navigate to Budget, then browser Back returns to Dashboard.
3. Navigate to Financial Position, then Back/Forward updates views correctly.
4. Open direct hash URL (for example `#/spending`) and confirm target view opens.
5. Open invalid hash (for example `#/not-real`) and confirm safe fallback.
6. In Monthly Balances:
   - no entry shows `Not checked`
   - enter positive balance then clear it and confirm returns to `Not checked`
   - click `Mark checked, no balance` and confirm `Checked � No balance`
7. Focus numeric amount inputs containing `0` and confirm direct typing overwrites value without manual delete.
8. Confirm no critical console errors during the above flows.

## Phase 51 verification note

- Phase 50 fixes are code/test-verified in local regression runs.
- Deployed-app manual pass/fail logging is tracked in docs/post-fix-production-smoke-test-results.md.
