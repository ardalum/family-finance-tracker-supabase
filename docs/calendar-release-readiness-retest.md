# Calendar Release Readiness Retest

Date: 2026-05-18
Scope: Spedger Phase 61 FullCalendar migration retest

## 1) Calendar feature scope

- Calendar remains a secondary Spedger workspace sourced from existing data only.
- FullCalendar React now renders the default month grid (`dayGridMonth`).
- Agenda grouped list remains available via Calendar/Agenda toggle.
- Selected-day detail panel remains below/beside the calendar depending on viewport.
- Calendar does not write or persist finance records.

## 2) Calendar entry points

- Dashboard quick action: `Calendar`
- Account menu Tools: `Calendar`
- Direct hash route: `#/calendar`

## 3) Desktop calendar retest checklist

- [ ] Calendar opens from Dashboard quick action.
- [ ] FullCalendar month grid is the default Calendar view.
- [ ] Prev/Today/Next controls move month view correctly.
- [ ] Month selector and FullCalendar month view stay synchronized.
- [ ] Event labels render compactly and remain readable.
- [ ] Clicking a date updates selected-day detail panel.
- [ ] Clicking a calendar event selects the event date.
- [ ] Selected-day panel shows event cards with correct status/amount/subtitle.
- [ ] Event action button opens expected source workspace.
- [ ] Agenda toggle still works and shows grouped date list.

## 4) Mobile calendar retest checklist

- [ ] Calendar opens without horizontal scrolling.
- [ ] FullCalendar month grid fits viewport width.
- [ ] FullCalendar controls (Prev/Today/Next) remain tappable and do not overflow.
- [ ] Date taps update selected-day detail panel.
- [ ] Selected-day detail appears directly below grid.
- [ ] Event labels remain compact and do not break layout.
- [ ] Event action buttons are easy to tap.

## 5) Event accuracy checklist

- [ ] Card due dates appear on correct dates with accurate status behavior.
- [ ] Statement close dates appear on correct dates with generated/not-yet behavior.
- [ ] Recurring bill due dates/statuses/amount behavior remain accurate.
- [ ] Income entries appear on actual entry dates with correct amounts.
- [ ] Month-close marker appears on month-end date with correct status.
- [ ] Duplicate event IDs are not emitted in monthly event output.
- [ ] Invalid dates are safely excluded from rendered FullCalendar events.

## 6) Navigation checklist

- [ ] Calendar opens from Dashboard quick action.
- [ ] Calendar opens from Account menu Tools.
- [ ] `#/calendar` route opens Calendar.
- [ ] Invalid hash route falls back safely.
- [ ] Browser Back/Forward remains functional across Calendar transitions.
- [ ] Event action buttons route correctly to Cards/Bills/Income/Dashboard.
- [ ] Main nav remains unchanged: Dashboard, Cards, Budget, Spending, Bills, Insights.

## 7) Known limitations

- No custom calendar events yet.
- No reminders/notifications yet.
- No Google/Apple calendar export yet.
- No automatic bank/card sync.
- Calendar events come from existing Spedger data only.

## 8) Go/no-go recommendation

- Recommendation: **Go** if `npm run verify` passes and manual browser/device smoke checks pass without critical regressions.
- Phase 62 blocker-focused retest details: `docs/fullcalendar-release-blocker-retest.md`
