# Calendar Feature Design

Last updated: 2026-05-18 (Phase 61 FullCalendar migration)

## Implementation status

- Phase 56: design and source audit completed.
- Phase 57: MVP started and implemented as a secondary `calendar` view using existing data only (no schema changes, no calendar persistence table).
- Phase 58: real month-grid calendar implemented as default view with responsive mobile layout and selected-day agenda panel.
- Phase 59: calendar hardening completed for event-accuracy QA, month-end close-date marker, duplicate-event ID safety, and selected-day/filter behavior polish.
- Phase 60: discoverability integration validated from Dashboard quick actions and Account menu Tools.
- Phase 61: custom month-grid replaced by FullCalendar dayGrid month view while preserving existing WalletFlow event generation and selected-day agenda behavior.
- Calendar now includes:
  - FullCalendar month grid (dayGridMonth)
  - compact day cell events with overflow handling via FullCalendar dayMaxEvents
  - selected day detail panel
  - Calendar/Agenda toggle (Calendar default)
- Remaining limits:
  - no reminders/notifications
  - no external calendar sync/export
  - no custom calendar events
  - no recurring-income prediction engine
  - no custom persisted calendar records (events remain derived from existing WalletFlow data)

## 1) Problem statement

WalletFlow needs a Calendar because key date-driven finance work is spread across multiple pages. Users currently have to switch between Cards, Bills, Income, and Monthly Close to understand timing.

A calendar can unify:

- credit-card payment due dates
- statement close dates
- recurring bill due dates
- expected income/paydays
- month-close reminders

Without this, users miss timing context and struggle to prioritize what needs attention this week or month.

## 2) User questions the calendar should answer

- What bills are due this week?
- Which credit cards are due soon?
- Which statements close soon?
- When is the next payday?
- What payments are already marked paid?
- What needs attention this month?
- What should I review before month close?

## 3) Event sources audit

### Credit card statement close dates and payment due dates

- Source files/helpers:
  - `src/features/creditCards/monthlyBalancesSupabaseService.js`
  - `src/features/creditCards/statementCycleUtils.js`
  - `src/features/creditCards/creditCardStatus.js`
- Key fields:
  - `statement_close_date`
  - `payment_due_date`
  - `month_key`
  - `paid`
  - `balance`
  - `status`
- Event types:
  - `card_payment_due`
  - `card_statement_close`
  - `card_payment_status`
- Persisted or computed:
  - dates are persisted in card statement/monthly balance records
  - due-state labels are computed from dates + paid/balance
- Calendar MVP readiness:
  - ready
- Known limitations:
  - status semantics depend on existing card status rules and month context

### Monthly card balance status

- Source files/helpers:
  - `src/features/creditCards/creditCardStatus.js`
- Key fields:
  - `balance`
  - `paid`
  - explicit no-balance marker behavior
  - due-date context
- Event type:
  - `card_status_badge` (computed display status)
- Persisted or computed:
  - computed from persisted row + date helpers
- Calendar MVP readiness:
  - ready for labels, not a separate persisted event
- Known limitations:
  - should avoid duplicate rendering if also showing due-date events

### Recurring bills due dates and paid/unpaid/skipped status

- Source files/helpers:
  - `src/features/recurring/recurringService.js`
- Key fields:
  - due day/date per month
  - paid flags
  - skipped flags
  - amount/title metadata
- Event type:
  - `recurring_bill_due`
- Persisted or computed:
  - recurring definitions persisted
  - due date and display status computed by month
- Calendar MVP readiness:
  - ready
- Known limitations:
  - status is month-relative and should be generated with selected month context

### Income entries and income source frequency

- Source files/helpers:
  - `src/features/income/incomeSupabaseService.js`
- Key fields:
  - `entry_date`
  - `month_key`
  - `amount`
  - source metadata (`source_type`, `frequency`, `active`)
- Event type:
  - `income_entry`
  - future `expected_payday` (derived)
- Persisted or computed:
  - entries persisted
  - future expected paydays from frequency would be computed
- Calendar MVP readiness:
  - ready for actual income entries
  - predicted paydays deferred
- Known limitations:
  - frequency is not currently a guaranteed scheduling engine

### Monthly close review status

- Source files/helpers:
  - `src/features/dashboard/monthlyCloseReviewSupabaseService.js`
- Key fields:
  - `month_key`
  - `status`
  - `reviewed_at`
  - manual checklist checks
- Event type:
  - `monthly_close_review`
- Persisted or computed:
  - persisted review records with computed checklist completeness signals
- Calendar MVP readiness:
  - ready as month-level marker/reminder
- Known limitations:
  - month-close is a period task, not a single hard due-date payment item

### Savings contributions (dated)

- Source files/helpers:
  - `src/features/savings/savingsSupabaseService.js`
- Key fields:
  - `contribution_date`
  - `month_key`
  - `amount`
- Event type:
  - `savings_contribution`
- Persisted or computed:
  - persisted entries
- Calendar MVP readiness:
  - optional for MVP; ready technically
- Known limitations:
  - contribution dates represent logged activity, not necessarily planned deadlines

### Transactions (future utility)

- Source files/helpers:
  - spending feature services/components
- Key fields:
  - transaction date
  - amount/category
- Event type:
  - potential future `transaction_activity`
- Persisted or computed:
  - persisted records
- Calendar MVP readiness:
  - deferred
- Known limitations:
  - can overwhelm calendar if mixed with operational due-date events

## 4) Calendar MVP scope

Recommended MVP should show:

- card payment due dates
- card statement close dates
- recurring bill due dates
- income entries/paydays (actual entry dates first)
- monthly close review marker
- simple status labels: `paid`, `unpaid`, `due soon`, `past due`, `skipped`, `completed`, `upcoming`

## 5) Calendar views

Options reviewed:

- Month grid
- Agenda list
- Week list
- Compact upcoming list

Current implementation:

- Calendar FullCalendar month-grid is now the default primary view.
- Agenda list remains available as a secondary toggle.
- Mobile uses compact FullCalendar month grid plus selected-day agenda below.

## 6) Navigation recommendation

Evaluated locations:

- main nav item
- Dashboard quick action
- Financial Position link
- account menu/tool entry
- Insights link

Recommendation:

- keep Calendar out of main nav initially
- ship as a secondary view first
- optionally add Dashboard quick action only if action density stays manageable
- revisit promotion to main nav after usage evidence

## 7) Calendar event model (no schema changes)

No new database table for MVP. Compose events from existing data with a normalized shape:

- `id`
- `source`
- `sourceId`
- `date`
- `title`
- `subtitle`
- `amount`
- `status`
- `severity`
- `targetView`
- `targetMonth`
- `sortOrder`

## 8) Calendar UX rules

- group events by date
- keep past-due items visible
- visually mute paid/completed items
- show amounts where relevant
- clicking an event opens the appropriate source workspace
- empty state explains where events come from and what to populate
- calendar must not change financial totals
- calendar must not create duplicate payment records

## 9) Future enhancements

- month-grid calendar view
- reminders/notifications
- custom user calendar events
- export/sync to Google/Apple calendars
- recurring-income prediction
- savings-goal deadlines
- event-type filters
- household member filters

## 10) Risks

- confusing computed events with saved records
- incorrect due-date calculations
- double-counting overlapping card/bill events
- calendar clutter and low scanability
- mobile density/usability regressions
- adding a main-nav item too early
- inaccurate recurring-income prediction
- users assuming external calendar sync exists when it does not

## 11) Implementation plan

- **Phase 57**: Calendar MVP from existing data (secondary view, agenda/list) - completed
- **Phase 58**: Calendar hardening + mobile polish - completed
- **Phase 59**: Calendar event-accuracy QA and hardening - completed
- **Phase 60**: Calendar dashboard/account-menu discoverability and release-readiness retest - completed
- **Phase 61**: FullCalendar month-grid migration - completed
- **Phase 62**: Reminders/export integration design
