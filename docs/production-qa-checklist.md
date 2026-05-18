# Production QA checklist

Use this checklist before each production release.

## Preconditions

- [ ] Use a test household and test account where destructive actions can be safely validated.
- [ ] Keep recent backups private and accessible before QA starts.
- [ ] Confirm environment variables are set for the deployment target.

## Dashboard

- [ ] Total credit limit matches all active cards only.
- [ ] Statement balance total matches entered monthly balances.
- [ ] Unpaid balance total matches unpaid statement amounts.
- [ ] Due soon and past due credit-card alerts appear correctly.
- [ ] Budget overage and near-limit alerts appear correctly.
- [ ] Recurring unpaid and past-due alerts appear correctly.
- [ ] Cash-flow summary card appears.
- [ ] Cash-flow income/spending/savings/recurring values match selected month data.
- [ ] Missing-income state appears when no income entries exist for selected month.
- [ ] Cash-flow formula copy is clear: Income - spending - recurring remaining - savings.
- [ ] Cash-flow limitation copy is clear: unpaid card balances are excluded from MVP leftover.
- [ ] Cash-flow action buttons route to Income, Savings, Spending, and Bills workspaces.
- [ ] Estimated leftover updates when income/savings/spending/recurring values change.
- [ ] Dashboard quick actions are compact and limited to: Update card balances, Add transactions, Open recurring bills, Review budget, Financial Position, and Calendar.
- [ ] Dashboard does not show separate quick actions for Income, Savings, Accounts, Liabilities/Debt, or Net Worth.
- [ ] Financial Position quick action opens the Financial Position hub.
- [ ] Calendar quick action opens the Calendar workspace.
- [ ] Monthly Close checklist includes optional review prompts for account balances, debt snapshots, net worth summary, and net worth trends.
- [ ] New Monthly Close review prompts do not block `Mark month as reviewed`.
- [ ] Monthly Close prompt navigation opens Accounts, Liabilities, Net Worth, and Insights correctly.

## Cards

- [ ] Add credit card works.
- [ ] Edit credit card works.
- [ ] Deactivate card works.
- [ ] Delete card works and confirmation dialog appears.
- [ ] Monthly balances desktop table works.
- [ ] Monthly balances mobile cards work.
- [ ] Paid checkbox updates correctly.
- [ ] Mark no balance action works.
- [ ] Statement details save correctly.
- [ ] Autopay fields save correctly.
- [ ] Minimum payment and paid amount fields save correctly.

## Budget

- [ ] Add budget category works.
- [ ] Edit budget category works.
- [ ] Delete budget category works.
- [ ] Copy previous month works.
- [ ] Default budget flows still work.

## Spending

- [ ] Add transaction works.
- [ ] Edit transaction works.
- [ ] Delete transaction works with confirmation dialog.
- [ ] Split transaction save works for valid split totals.
- [ ] Invalid split totals are rejected.
- [ ] Refund transaction behavior is correct.
- [ ] Payment transaction behavior is correct.
- [ ] Filters work (search/card/category/type/payment/source/quick filters).
- [ ] Sorting works.
- [ ] Mobile layout remains usable.

## Recurring Bills

- [ ] Add recurring bill works.
- [ ] Mark paid works.
- [ ] Mark unpaid works.
- [ ] Skip works.
- [ ] Variable bill actual amount flow works.
- [ ] Recurring-generated transactions appear correctly.

## Income

- [ ] Income page opens from Dashboard quick action and Account menu Tools.
- [ ] Add income source works.
- [ ] Edit income source works.
- [ ] Delete income source works with confirmation wording.
- [ ] Add income entry works.
- [ ] Edit income entry works.
- [ ] Delete income entry works with confirmation wording.
- [ ] Month switching filters income entries correctly.
- [ ] Monthly income total updates correctly for selected month.
- [ ] Income entries do not change Spending totals.
- [ ] Income entries do not change Budget totals.
- [ ] Inactive income sources are not shown in active source selector options.

## Savings

- [ ] Savings page opens from Dashboard quick action and Account menu Tools.
- [ ] Add savings goal works.
- [ ] Edit savings goal works.
- [ ] Delete savings goal works with confirmation wording.
- [ ] Add savings contribution works.
- [ ] Edit savings contribution works.
- [ ] Delete savings contribution works with confirmation wording.
- [ ] Month switching filters savings contributions correctly.
- [ ] Monthly savings contribution total updates correctly for selected month.
- [ ] Goal progress updates correctly after contribution changes.
- [ ] Savings entries do not change Spending totals.
- [ ] Savings goals/contributions do not change Budget totals.
- [ ] Inactive savings goals are not shown in active goal selector options.

## Accounts

- [ ] Accounts page opens from Dashboard quick action and Account menu Tools.
- [ ] Add cash account works.
- [ ] Edit cash account works.
- [ ] Delete cash account works with confirmation wording.
- [ ] Add account balance snapshot works.
- [ ] Edit account balance snapshot works.
- [ ] Delete account balance snapshot works with confirmation wording.
- [ ] Month switching filters snapshot list correctly.
- [ ] Liquid cash total updates correctly for selected month snapshots.
- [ ] Account snapshots do not change Spending totals.
- [ ] Account snapshots do not change Income totals.
- [ ] Account snapshots do not change Savings totals.
- [ ] Account snapshots do not change Budget totals.

## Liabilities

- [ ] Liabilities page opens from Dashboard quick action and Account menu Tools.
- [ ] Add liability account works.
- [ ] Edit liability account works.
- [ ] Delete liability account works with confirmation wording.
- [ ] Add liability balance snapshot works.
- [ ] Edit liability balance snapshot works.
- [ ] Delete liability balance snapshot works with confirmation wording.
- [ ] Month switching filters liability snapshots correctly.
- [ ] Total debt updates correctly for selected month.
- [ ] Latest balance per liability account updates after snapshot changes.
- [ ] Liability snapshots do not change Spending totals.
- [ ] Liability snapshots do not change Income totals.
- [ ] Liability snapshots do not change Savings totals.
- [ ] Liability snapshots do not change Budget totals.
- [ ] Liability snapshots do not change Dashboard cash-flow estimated leftover.
- [ ] Credit-card double-counting helper copy is visible and understandable.
- [ ] Linked credit card behavior is clear (informational only; no auto-filled balances).
- [ ] Inactive liability accounts are excluded from active snapshot account options.

## Net Worth

- [ ] Net Worth page opens from Dashboard quick action and Account menu Tools.
- [ ] Selected month filter updates net worth summary.
- [ ] Month-selection helper copy is clear (selected month uses latest snapshots recorded in that month).
- [ ] Total assets reflects selected-month latest cash account snapshots.
- [ ] Total liabilities reflects selected-month latest liability snapshots.
- [ ] Net worth equals assets minus liabilities.
- [ ] Empty state appears when account/debt snapshots are missing.
- [ ] Assets-only and liabilities-only empty-state guidance is clear.
- [ ] Credit-card debt appears only when entered as liability snapshots.
- [ ] Savings goals are not counted unless represented by account snapshots.
- [ ] Negative net-worth status copy is clear and understandable.
- [ ] Net worth view does not change Spending totals.
- [ ] Net worth view does not change Income totals.
- [ ] Net worth view does not change Savings totals.
- [ ] Net worth view does not change Budget totals.
- [ ] Net worth view does not change Dashboard cash-flow estimated leftover.

## Net Worth Trends (Insights)

- [ ] Insights Net Worth Trends section appears.
- [ ] Trend range switch works for last 6 and last 12 months.
- [ ] Empty state appears when no account/debt snapshots exist.
- [ ] One-month state appears with guidance to add more months.
- [ ] Missing months are shown as no data.
- [ ] Assets-only and liabilities-only scenarios render clearly.
- [ ] Net worth trend values use snapshot data only.
- [ ] Net worth trends do not change Spending, Income, Savings, Budget, or cash-flow totals.

## Financial Position Hub

- [ ] Financial Position opens from Dashboard quick action.
- [ ] Financial Position opens from Account menu Tools.
- [ ] Financial Position mobile layout opens cleanly at small widths (no horizontal scrolling).
- [ ] Financial Position month selector updates summaries.
- [ ] Summary cards show income, savings, liquid cash, total debt, net worth, and estimated leftover.
- [ ] Summary cards remain readable on mobile (labels and values are legible).
- [ ] Needs update advisories appear when month data is missing.
- [ ] Needs update advisories are easy to scan on mobile.
- [ ] Empty-state guidance appears when all summarized inputs are missing for selected month.
- [ ] Net-worth partial-data advisory appears when only account or only liability snapshots exist.
- [ ] Loading and error states are clear and non-alarming when data is still available elsewhere.
- [ ] Hub links open Income, Savings, Accounts, Liabilities, Net Worth, and Insights.
- [ ] Hub action buttons are easy to tap on mobile.
- [ ] Hub does not change Spending, Budget, Cards, Bills, Income, Savings, Accounts, Liabilities, or Net Worth calculations.

## Calendar

- [ ] Calendar opens from Dashboard quick action.
- [ ] Calendar opens from Account menu Tools.
- [ ] Month selector updates the event list.
- [ ] Calendar month grid appears first by default.
- [ ] Calendar grid renders Sun-Sat columns.
- [ ] Calendar grid aligns selected-month days with leading/trailing muted days.
- [ ] Calendar grid date cells show event indicators/counts when events exist.
- [ ] Clicking/tapping a date updates selected-day event details.
- [ ] Selected-day panel shows "No events for this day." when empty.
- [ ] Empty-state guidance appears when no event sources exist for selected month.
- [ ] Card payment due events appear and route to Cards.
- [ ] Card statement close events appear and route to Cards.
- [ ] Recurring bill events appear and route to Bills.
- [ ] Income entry events appear and route to Income.
- [ ] Month-close marker event appears and routes to Dashboard.
- [ ] Card due/paid/past-due/not-checked statuses are accurate for selected month context.
- [ ] Statement-close generated/not-yet status is accurate and does not duplicate due-date events.
- [ ] Recurring bill status/amount display is accurate (variable actual amount when available, fixed estimated fallback otherwise).
- [ ] Income events use actual entry dates only (no predicted payday events in MVP).
- [ ] Month-close marker uses month-end date and reviewed/in-progress/not-reviewed status is accurate.
- [ ] Events are grouped by date and sorted consistently.
- [ ] Agenda toggle still works and shows grouped monthly list view.
- [ ] Mobile calendar has no horizontal scrolling and day cells remain tappable.
- [ ] Calendar +N more overflow labels and mobile event indicators are accurate.
- [ ] Calendar does not create or mutate financial records by itself.

## Backup / Restore

- [ ] Export backup works.
- [ ] Import backup works with trusted files only.
- [ ] No obvious duplicate records after import.
- [ ] Team confirms backups contain sensitive finance data and are stored privately.
- [ ] Supabase JSON export includes `monthlyCloseReviews`.
- [ ] Excel export includes `Monthly Close Reviews` sheet.
- [ ] Supabase merge preview/import summary shows counts for monthly close, income, savings, cash accounts, and liabilities sections.
- [ ] Supabase merge import keeps computed-only outputs out of persisted restore payloads.
- [ ] Invalid JSON backup selection shows a clear validation error and blocks merge.
- [ ] Empty/shape-invalid backup files are rejected before merge.
- [ ] Unknown backup sections show warnings and do not crash import.
- [ ] Computed-only backup sections (if present) show warnings and are not restored as persisted rows.
- [ ] Supabase JSON export includes `incomeSources` and `incomeEntries`.
- [ ] Excel export includes `Income Sources` and `Income Entries` sheets.
- [ ] Supabase JSON export includes `savingsGoals` and `savingsContributions`.
- [ ] Excel export includes `Savings Goals` and `Savings Contributions` sheets.
- [ ] Supabase JSON export includes `cashAccounts` and `accountBalanceSnapshots`.
- [ ] Excel export includes `Cash Accounts` and `Account Balance Snapshots` sheets.
- [ ] Supabase JSON export includes `liabilityAccounts` and `liabilityBalanceSnapshots`.
- [ ] Excel export includes `Liability Accounts` and `Liability Balance Snapshots` sheets.

## Household / Settings

- [ ] Household profiles management works.
- [ ] Role behavior (if available in environment) is correct.
- [ ] Account deletion flow works (test account only).
- [ ] Household finance data deletion works with exact confirmation phrase.

## Deployment

- [ ] `npm run verify` passes locally.
- [ ] GitHub Actions deploy workflow passes.
- [ ] Supabase Edge Functions are deployed (`delete-account`, `delete-household-finance-data`).
- [ ] Supabase Auth redirect URLs are configured for production and local callback needs.
- [ ] Production smoke test completed on deployed app.

## Post-deploy smoke test

- [ ] Dashboard opens and key summaries render.
- [ ] Cards opens and month selector works.
- [ ] Budget opens and totals render.
- [ ] Spending opens and transaction list renders.
- [ ] Bills opens and recurring sections render.
- [ ] Insights opens and charts render.

## Cross-Page Month Switching

- [ ] Month switching works on Dashboard, Cards, Budget, Spending, Bills, Insights, Income, Savings, Accounts, Liabilities, Net Worth, and Financial Position.
- [ ] Month switches do not crash pages when a month has little/no data.

## Empty and Missing-Data States

- [ ] Empty-state guidance appears on pages with no records.
- [ ] Missing-data advisories are readable and actionable (especially Financial Position and Net Worth).
- [ ] No dead buttons are present in empty states.

## Navigation and Account Menu Integrity

- [ ] Dashboard quick actions route to valid targets.
- [ ] Account menu opens and each entry routes to a valid view.
- [ ] Secondary views (backup/settings/legal/support) open without dead-end behavior.

## Mobile Overflow Guard

- [ ] No obvious horizontal scrolling on Dashboard, Cards, Spending, Bills, Insights, Financial Position, and Calendar at common mobile widths.

## Browser History Navigation

- [ ] Dashboard -> Budget then browser Back returns to Dashboard.
- [ ] Dashboard -> Financial Position then browser Back returns to Dashboard.
- [ ] Browser Forward restores the later view after Back.
- [ ] Direct hash URL opens expected view (for example #/spending).
- [ ] Invalid hash falls back safely without app crash.

## Account Menu UX

- [ ] Account menu Tools section remains compact (Financial Position, Calendar, Backup & Restore, App Settings).
- [ ] Detailed finance pages remain reachable from Financial Position links.

## Monthly Balance Check-State Safety

- [ ] No monthly-balance entry renders Not checked.
- [ ] Entering and then clearing balance does not leave false Checked - No balance.
- [ ] Explicit Mark no balance action renders Checked - No balance.

## Amount Input Typing UX

- [ ] Numeric amount fields allow direct typing over default `0` on focus.
- [ ] Clearing amount fields does not create false complete/paid/checked states.
