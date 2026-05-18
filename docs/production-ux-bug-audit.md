# Production UX Bug Audit (Phases 50, 54, and 55)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Source: production smoke-test findings + targeted code audit

## 1) Issues found during deployed-app smoke testing

### Critical

- Browser back/forward did not navigate between app views (state-only navigation).

### High

- Account menu Tools section was too long and overloaded with many detailed finance entries.
- Monthly card balance status could show `Checked - No balance` after clearing/deleting balance input without explicit user intent.
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
- Zero-balance status logic and save/load normalization conflated not-checked vs explicit no-balance states.
- Numeric input focus behavior did not optimize overwrite flow for default `0` values.

## 4) Fix applied or deferred

### Phase 50 fixes

- Added hash-based URL-backed view synchronization (`#/...`) with safe fallback behavior.
- Added browser back/forward support via hashchange-driven active view updates.
- Simplified account menu Tools to compact entries:
  - Financial Position
  - Backup & Restore
  - App Settings
- Kept detailed finance pages accessible through Financial Position (not deleted).
- Added numeric input focus-select behavior for `type="number"` in shared input component and monthly balance inputs.

### Phase 50 follow-up finding

- Monthly-balance fix was incomplete. Production follow-up showed loader/save paths could still surface implicit checked state on zero-balance rows.

### Corrected in Phase 54

- Monthly-balance status logic now separates implicit zero from explicit no-payment-needed:
  - `no entry` => `Not checked`
  - `balance <= 0 && paid false` => `Not checked`
  - `balance <= 0 && paid true` => `Checked - No balance` (explicit marker)
- Loader behavior no longer auto-promotes zero-balance unpaid rows into paid/checked state.
- Upsert behavior now deletes/reset rows for zero/unpaid entries instead of persisting implicit checked state.
- Clearing/resetting monthly balance now reliably returns status to `Not checked`.
- Added explicit reset action for cards marked `Checked - No balance`.
- Corrected label encoding to `Checked - No balance`.

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
   - click `Mark no balance` and confirm `Checked - No balance`
   - use reset action and confirm status returns to `Not checked`
7. Focus numeric amount inputs containing `0` and confirm direct typing overwrites value without manual delete.
8. Confirm no critical console errors during the above flows.

## Phase 55 follow-up note

- Phase 55 fixed remaining release blockers after Phase 54:
  - no-balance row actions were reduced to compact inline controls.
  - remaining mojibake/replacement-character text issues were corrected across UI/docs.
  - encoding cleanliness regression test was added.

## Phase 51/54/55 verification note

- Phase 50 monthly-balance fix was re-opened after follow-up evidence.
- Phase 54 applies the corrected service + status + reset behavior with targeted regression tests.
- Phase 55 applies final UI/copy polish and encoding cleanup before release tagging.
- Deployed-app manual pass/fail logging is tracked in `docs/post-fix-production-smoke-test-results.md`.
