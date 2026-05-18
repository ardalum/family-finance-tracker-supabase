# Calendar Release Readiness Retest

Date: 2026-05-18  
Scope: WalletFlow Phase 60 Calendar dashboard integration and release-readiness retest

## 1) Calendar feature scope

- Secondary Calendar workspace using existing WalletFlow data only.
- Default month-grid view with Agenda toggle.
- Event sources:
  - credit card due dates
  - credit card statement close dates
  - recurring bills
  - income entries
  - monthly close status
- Calendar is read-only orchestration UI and does not write finance records by itself.

## 2) Calendar entry points

- Dashboard Quick action:
  - Label: `Calendar`
  - Description: `Review upcoming card, bill, income, and close dates.`
- Account menu `Tools`:
  - `Financial Position`
  - `Calendar`
  - `Backup & Restore`
  - `App Settings`

## 3) Desktop calendar retest checklist

- [ ] Dashboard opens and quick actions remain compact.
- [ ] Calendar quick action is visible and not visually cluttered.
- [ ] Calendar opens from Dashboard quick action.
- [ ] Calendar month-grid appears first.
- [ ] Month selector updates visible calendar data.
- [ ] Date click updates selected-day panel.
- [ ] `+N more` day overflow labels are accurate.
- [ ] Empty selected day clearly shows `No events for this day.`
- [ ] Event action buttons are consistent and open the correct target view.
- [ ] Agenda toggle remains available and functional.

## 4) Mobile calendar retest checklist

- [ ] Dashboard remains usable and quick action is tappable.
- [ ] Calendar opens from Dashboard without horizontal overflow.
- [ ] Month-grid remains 7 columns and fits screen width.
- [ ] Date cells remain tappable.
- [ ] Selected-day agenda appears directly below the grid.
- [ ] Event indicators/dots remain visible and contained in day cells.
- [ ] Event action buttons are easy to tap.
- [ ] Account menu remains compact when opened on mobile.

## 5) Event accuracy checklist

- [ ] Card due-date events appear on correct dates with accurate paid/unpaid/past-due/not-checked status behavior.
- [ ] Statement-close events appear on correct dates with accurate generated/not-yet status behavior.
- [ ] Recurring bill events appear on due dates with accurate status and amount behavior (actual when available, estimated fallback).
- [ ] Income events use actual entry dates and amounts only.
- [ ] Month-close marker appears on month-end date with reviewed/in-progress/not-reviewed status accuracy.
- [ ] No duplicate event IDs appear in composed month event output.

## 6) Navigation checklist

- [ ] Calendar opens from Dashboard quick action.
- [ ] Calendar opens from Account menu Tools.
- [ ] Direct hash route `#/calendar` opens Calendar.
- [ ] Invalid hash route falls back safely.
- [ ] Browser Back/Forward navigation remains functional across Calendar transitions.
- [ ] Calendar event actions route to Cards, Bills, Income, and Dashboard as expected.
- [ ] Main nav remains unchanged: Dashboard, Cards, Budget, Spending, Bills, Insights.

## 7) Known limitations

- No custom calendar events yet.
- No reminders/notifications yet.
- No Google/Apple calendar export yet.
- No automatic bank/card sync.
- Calendar events come from existing WalletFlow data only.

## 8) Go/no-go recommendation

- Recommendation: **Go**, conditional on manual browser/device smoke completion in target environment and no critical issues found.
- Automated release gate should include successful `npm run verify` on release commit.
