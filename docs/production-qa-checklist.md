# Production QA checklist

Use this checklist before each production release.

## Preconditions

- [ ] Use a test household and test account where destructive actions can be safely validated.
- [ ] Keep recent backups private and accessible before QA starts.
- [ ] Confirm environment variables are set for the deployment target.
- [ ] After hard refresh, every month selector opens on the current real-world month until the user manually changes it.

## Dashboard

- [ ] Total credit limit matches all active cards only.
- [ ] Statement balance total matches entered monthly balances.
- [ ] Unpaid balance total matches unpaid statement amounts.
- [ ] Due soon and past due credit-card alerts appear correctly.
- [ ] Budget overage and near-limit alerts appear correctly.
- [ ] Recurring unpaid and past-due alerts appear correctly.
- [ ] Financial Pulse summary appears.
- [ ] Financial Pulse separates cash position, spending/budget usage, upcoming obligations, and savings.
- [ ] Missing cash/account snapshot state shows helpful guidance instead of pretending income minus spending is current cash.
- [ ] Spending this month is presented as budget/spending usage, not immediate cash outflow.
- [ ] Card purchases are not labeled as current cash leaving today; card payments/obligations are handled separately.
- [ ] Financial Pulse action buttons route to Income, Savings, Spending, and Bills workspaces.
- [ ] Planned cash cushion, if shown, is framed as a planning estimate rather than actual bank balance.
- [ ] Dashboard quick actions are compact and limited to: Update card balances, Add transactions, Open recurring bills, Review budget, Financial Position, and Calendar.
- [ ] Dashboard does not show separate quick actions for Income, Savings, Accounts, Liabilities/Debt, or Net Worth.
- [ ] Financial Position quick action opens the Financial Position hub.
- [ ] Calendar quick action opens the Calendar workspace.
- [ ] Monthly Close checklist includes optional review prompts for account balances, debt snapshots, net worth summary, and net worth trends.
- [ ] New Monthly Close review prompts do not block `Mark month as reviewed`.
- [ ] Monthly Close prompt navigation opens Accounts, Liabilities, Net Worth, and Insights correctly.

## App Shell Navigation

- [ ] Desktop shows a true left sidebar (not top-nav-only) and content reflows beside it.
- [ ] Sidebar collapse/expand control works and keeps icon-only entries accessible.
- [ ] Mobile shows a hamburger button that opens a drawer.
- [ ] Mobile app header remains a compact single row with no overlapping controls.
- [ ] WalletFlow wordmark is not clipped on mobile; phone widths show compact branding instead.
- [ ] Hamburger, alert, Quick Add, and account buttons have balanced icon sizing/tap targets.
- [ ] Household selector does not overflow or overlap mobile header controls.
- [ ] Quick Add appears once as a compact mobile shell action and remains tappable.
- [ ] Body/app has no page-level horizontal scrolling at 360px, 375px, 390px, or 414px.
- [ ] Drawer contains grouped sections: Main, Planning, Money Setup, System.
- [ ] Group headers are expandable/collapsible with clear chevrons and accessible expanded state.
- [ ] Main is expanded by default; Planning/Money Setup/System are collapsed by default unless active.
- [ ] Active route auto-expands its group.
- [ ] Money Setup entries (Income, Savings, Accounts, Liabilities) are directly reachable in sidebar/drawer.
- [ ] Selecting a drawer navigation item closes the drawer.
- [ ] Quick Add is reachable from both desktop and mobile shell surfaces.

## Cards

- [ ] Add credit card works.
- [ ] Edit credit card works.
- [ ] Deactivate card works.
- [ ] Delete card works and confirmation dialog appears.
- [ ] Monthly balances desktop table works.
- [ ] Monthly balances mobile cards work.
- [ ] Credit Cards page has no page-level horizontal scrolling on mobile.
- [ ] Monthly balance summary cards stack/wrap on mobile and large currency values stay inside cards.
- [ ] Monthly balance controls and filters wrap without forcing viewport overflow.
- [ ] Paid checkbox updates correctly.
- [ ] Mark no balance action works.
- [ ] Statement details save correctly.
- [ ] Past-due unpaid statement balances auto-sync into Liabilities/Debt as linked credit-card debt.
- [ ] Partial card payments sync only the remaining unpaid statement amount.
- [ ] Marking a past-due statement paid removes the auto-synced liability snapshot without deleting user-created snapshots.
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
- [ ] Recurring/Bills page has no page-level horizontal scrolling on mobile.
- [ ] Recurring summary cards stack/wrap on mobile without clipping amount values.
- [ ] Wide recurring bill review tables scroll inside their card container only when needed.

## Income

- [ ] Income page opens from Dashboard quick action and Tools workspace.
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

- [ ] Savings page opens from Dashboard quick action and Tools workspace.
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

- [ ] Accounts page opens from Dashboard quick action and Tools workspace.
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
- [ ] Cash account type labels display professional casing such as `Checking`, `Savings`, and `Cash`.

## Liabilities

- [ ] Liabilities page opens from Dashboard quick action and Tools workspace.
- [ ] Add liability account works.
- [ ] Edit liability account works.
- [ ] Delete liability account works with confirmation wording.
- [ ] Add liability balance snapshot works.
- [ ] Edit liability balance snapshot works.
- [ ] Delete liability account opens an app modal confirmation, not native browser confirm.
- [ ] Delete liability balance snapshot opens an app modal confirmation, not native browser confirm.
- [ ] Canceling the delete modal does not delete the debt record.
- [ ] Confirming the delete modal deletes the selected debt record.
- [ ] Auto-synced card debt delete warning explains it may reappear if the card remains past due and unpaid.
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
- [ ] Past-due unpaid credit card statements are automatically reflected as card debt.
- [ ] Auto-synced card debt does not create duplicate liability accounts or duplicate auto-synced snapshots.
- [ ] User-created liability snapshots for a linked card/month are not deleted by auto-sync.
- [ ] Inactive liability accounts are excluded from active snapshot account options.
- [ ] When no liability data exists for selected month, `Confirm no liabilities` is available.
- [ ] Confirmed no-liabilities state is shown and can be reset via `Reset liability review`.
- [ ] False missing-liability warning is suppressed in Insights after confirmation.
- [ ] False missing-liability wording is suppressed in Monthly Close, Net Worth, and Financial Position after confirmation.
- [ ] Liability type labels display professional casing such as `Credit Card`, `Auto Loan`, and `Mortgage`.
- [ ] If liability snapshots are later added for the month, snapshot-based liability behavior takes priority over no-liability confirmation messaging.
- [ ] Real auto-synced card debt takes priority over a previously confirmed no-liability review state.

## Net Worth

- [ ] Net Worth page opens from Dashboard quick action and Tools workspace.
- [ ] Selected month filter updates net worth summary.
- [ ] Month-selection helper copy is clear (selected month uses latest snapshots recorded in that month).
- [ ] Total assets reflects selected-month latest cash account snapshots.
- [ ] Total liabilities reflects selected-month latest liability snapshots.
- [ ] Prior active liability snapshots carry forward when the selected month has no newer liability snapshot.
- [ ] Current-month liability snapshots override carried-forward values.
- [ ] Explicit zero liability snapshots stop carry-forward.
- [ ] Inactive/closed liabilities do not incorrectly carry forward.
- [ ] Net worth equals assets minus liabilities.
- [ ] Empty state appears when account/debt snapshots are missing.
- [ ] Confirmed no-liability months show confirmation-aware copy instead of continuing to warn about missing liability snapshots.
- [ ] Assets-only and liabilities-only empty-state guidance is clear.
- [ ] Credit-card debt appears only when entered as liability snapshots.
- [ ] Savings goals are not counted unless represented by account snapshots.
- [ ] Negative net-worth status copy is clear and understandable.
- [ ] Net worth view does not change Spending totals.
- [ ] Net worth view does not change Income totals.
- [ ] Net worth view does not change Savings totals.
- [ ] Net worth view does not change Budget totals.
- [ ] Net worth view does not change Dashboard cash-flow estimated leftover.
- [ ] Debt payment helper copy reminds the user to update account snapshots after paying debt where shown.

## Net Worth Trends (Insights)

- [ ] Insights Net Worth Trends section appears.
- [ ] Trend range switch works for last 6 and last 12 months.
- [ ] Empty state appears when no account/debt snapshots exist.
- [ ] One-month state appears with guidance to add more months.
- [ ] Missing months are shown as no data.
- [ ] Assets-only and liabilities-only scenarios render clearly.
- [ ] Net worth trend values use snapshot data only.
- [ ] Net worth trend does not show fake improvement when current-month liability snapshots are missing but prior active debt exists.
- [ ] Net worth trends do not change Spending, Income, Savings, Budget, or cash-flow totals.
- [ ] Spending Composition chart/list remain inside the card at desktop and mobile widths.
- [ ] Spending Composition list shows amount and percentage context.
- [ ] Spending Composition handles large category lists without horizontal overflow.
- [ ] Spending Composition does not force unnecessary internal vertical scrolling when category count is small/normal.
- [ ] Spending Composition centers donut chart with ranking below and balanced two-column layout on desktop, single-column on mobile.

## Financial Position Hub

- [ ] Financial Position opens from Dashboard quick action.
- [ ] Financial Position opens from Tools workspace.
- [ ] Financial Position mobile layout opens cleanly at small widths (no horizontal scrolling).
- [ ] Financial Position month selector updates summaries.
- [ ] Summary cards show income, savings, liquid cash, total debt, net worth, and estimated leftover.
- [ ] Summary cards remain readable on mobile (labels and values are legible).
- [ ] Needs update advisories appear when month data is missing.
- [ ] No-liability confirmed months show confirmation-aware guidance instead of missing-liability warnings.
- [ ] Needs update advisories are easy to scan on mobile.
- [ ] Empty-state guidance appears when all summarized inputs are missing for selected month.
- [ ] Net-worth partial-data advisory appears when only account or only liability snapshots exist.
- [ ] Loading and error states are clear and non-alarming when data is still available elsewhere.
- [ ] Hub links open Income, Savings, Accounts, Liabilities, Net Worth, and Insights.
- [ ] Hub action buttons are easy to tap on mobile.
- [ ] Hub does not change Spending, Budget, Cards, Bills, Income, Savings, Accounts, Liabilities, or Net Worth calculations.

## Calendar

- [ ] Calendar opens from Dashboard quick action.
- [ ] Calendar opens from Tools workspace.
- [ ] FullCalendar month grid appears first by default.
- [ ] FullCalendar Prev/Today/Next controls work and remain usable.
- [ ] FullCalendar remains readable at 360px and 390px mobile widths.
- [ ] Month selector updates the event list.
- [ ] Calendar month selector and FullCalendar month view stay synchronized.
- [ ] Calendar date cells show compact events with overflow handling.
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
- [ ] FullCalendar controls do not overflow at mobile widths.
- [ ] Mobile compact event rendering remains readable (labels or compact dots/counts).
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

## Privacy / Trust

- [ ] Account menu remains compact and account-focused (no daily planning tools mixed into it).
- [ ] Account Settings shows Security & session context clearly.
- [ ] Data & Privacy page explains data scope, backup/export options, restore/import caution, and deletion options.
- [ ] Backup/Restore warnings mention trusted files, invalid JSON rejection, and merge behavior.
- [ ] Destructive actions use explicit wording for account deletion vs household-finance reset.
- [ ] Help/Support safety reminders include backup-before-risky-change guidance.

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
- [ ] No horizontal scrolling in the app shell when mobile drawer is open or closed.

## Browser History Navigation

- [ ] Dashboard -> Budget then browser Back returns to Dashboard.
- [ ] Dashboard -> Financial Position then browser Back returns to Dashboard.
- [ ] Browser Forward restores the later view after Back.
- [ ] Direct hash URL opens expected view (for example #/spending).
- [ ] Invalid hash falls back safely without app crash.

## Account Menu UX

- [ ] Account menu remains compact and account/trust focused.
- [ ] Detailed daily tools remain discoverable from Dashboard quick actions and the Tools workspace.

## Monthly Balance Check-State Safety

- [ ] No monthly-balance entry renders Not checked.
- [ ] Entering and then clearing balance does not leave false Checked - No balance.
- [ ] Explicit Mark no balance action renders Checked - No balance.

## Amount Input Typing UX

- [ ] Numeric amount fields allow direct typing over default `0` on focus.
- [ ] Clearing amount fields does not create false complete/paid/checked states.

## Phase 76 final manual checklist closure

Phase 76 separates automated/source-level coverage from manual browser evidence so the PR #354 mobile/regression checklist can be closed honestly before release tagging.

Automated/source-level checks completed locally on 2026-05-18:

- [x] `npm run format:check` passed.
- [x] `npm run build` passed.
- [x] `npm run test:run` passed (`481` tests, `0` failures).
- [x] `npm run lint` passed.
- [x] `npm run verify` passed.
- [x] Automated/source coverage confirms synced card debt does not duplicate linked liability accounts.
- [x] Automated/source coverage confirms synced card debt does not duplicate auto-synced liability snapshots.
- [x] Automated/source coverage confirms user-created liability records are not deleted accidentally by auto-sync.
- [x] Automated/source coverage confirms debt delete flows use app modal confirmation instead of native browser confirm.

Manual browser/mobile checks still required before final production approval:

- [ ] Requires browser/manual verification: Header does not overflow at 360px.
- [ ] Requires browser/manual verification: Header does not overflow at 375px.
- [ ] Requires browser/manual verification: Header does not overflow at 390px.
- [ ] Requires browser/manual verification: Header does not overflow at 414px.
- [ ] Requires browser/manual verification: Sidebar drawer opens, closes, and remains usable.
- [ ] Requires browser/manual verification: Household selector does not overflow.
- [ ] Requires browser/manual verification: Quick Add appears once and remains usable.
- [ ] Requires browser/manual verification: Credit Cards has no page-level horizontal scroll.
- [ ] Requires browser/manual verification: Recurring/Bills has no page-level horizontal scroll.
- [ ] Requires browser/manual verification: Insights charts are responsive.
- [ ] Requires browser/manual verification: Liabilities/Net Worth pages are usable.
- [ ] Requires browser/manual verification: No horizontal scrolling appears across the mobile smoke matrix.
- [ ] Requires browser/manual verification: Browser console has no critical runtime errors.

Release recommendation from this checklist state: **Conditional Go for RC tag handoff**, with final tag/release approval waiting for manual browser/mobile smoke evidence unless that evidence has already been captured outside this local code-only pass.
