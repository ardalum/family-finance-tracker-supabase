# FullCalendar Release Blocker Retest

Date: 2026-05-18
Scope: WalletFlow Phase 62 FullCalendar mobile polish and release-blocker retest

## 1) FullCalendar migration status

- FullCalendar remains the Calendar month-view renderer via:
  - `@fullcalendar/core`
  - `@fullcalendar/react`
  - `@fullcalendar/daygrid`
  - `@fullcalendar/interaction`
- Calendar still uses existing WalletFlow event generation as source of truth.
- Calendar remains a secondary view and does not introduce new persistence.

## 2) Desktop checks

- [ ] Calendar opens and FullCalendar month grid appears first.
- [ ] Calendar fits app container width without horizontal overflow.
- [ ] Prev/Today/Next controls are visible and usable.
- [ ] Month selector and FullCalendar month stay synchronized.
- [ ] Event labels are readable and compact.
- [ ] Overflow handling (`dayMaxEvents`) prevents crowded cells.
- [ ] Date click updates selected-day agenda panel.
- [ ] Event click safely selects event date.
- [ ] Agenda toggle still works.

## 3) Mobile checks

- [ ] No horizontal scrolling at 360px and 390px widths.
- [ ] Header controls remain tappable and do not overflow.
- [ ] FullCalendar grid fits viewport and day cells are tappable.
- [ ] Mobile event rendering stays compact and readable.
- [ ] Selected-day agenda appears immediately below calendar grid.
- [ ] Event action buttons remain easy to tap.
- [ ] Calendar summary/header content does not bury the calendar grid.

## 4) Event accuracy checks

- [ ] Card due-date events appear on correct dates.
- [ ] Statement close events appear on correct dates.
- [ ] Recurring bill events appear on correct dates.
- [ ] Income entry events appear on correct dates.
- [ ] Month-close event appears on correct date.
- [ ] Status/severity mapping remains accurate.
- [ ] Event action targets remain correct.
- [ ] Duplicate events are not emitted.
- [ ] Invalid dates are ignored safely without crashes.

## 5) Navigation checks

- [ ] Calendar opens from Dashboard quick action.
- [ ] Calendar opens from Account menu Tools.
- [ ] Direct hash route `#/calendar` works.
- [ ] Invalid hash route falls back safely.
- [ ] Browser Back/Forward still works across Calendar transitions.
- [ ] Event actions route correctly to Cards/Bills/Income/Dashboard.
- [ ] Main nav remains: Dashboard, Cards, Budget, Spending, Bills, Insights.

## 6) Known limitations

- No custom calendar events.
- No reminders/notifications.
- No Google/Apple calendar export.
- No automatic bank/card sync.
- Calendar uses existing WalletFlow data only.

## 7) Issues found/fixed

- Fixed timezone-sensitive month-sync check that relied on `toISOString()` by switching to local-date formatting.
- Added compact mobile event rendering (dot-style at very small widths) to reduce day-cell clutter.
- Tightened responsive FullCalendar sizing and event-label truncation behavior.

## 8) Go/no-go recommendation

- Recommendation: **Go**, conditional on manual browser/device smoke completion with no critical regressions.
- Automated gate requirement: `npm run verify` passes on release commit.
