# Visual Analytics, YTD Reporting, and Historical Performance Design (Phase 18)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Scope: Design-only planning for visual analytics and historical reporting (no chart implementation in this phase)

## 1. Problem Statement

WalletFlow currently has strong monthly operations for cards, spending, budgets, recurring bills, and monthly close. However, the product remains incomplete as a household finance tracker without visual analytics, year-to-date (YTD) reporting, previous-year comparison, and historical trend analysis.

Today, users can review month snapshots but cannot easily evaluate longer-term performance. The app does not yet answer key questions such as:

- How am I doing year-to-date?
- Am I spending more than last year?
- Which categories are trending up?
- What is my average monthly spending?
- Are bills increasing?
- Is my savings rate improving?
- Is my household financially improving over time?

## 2. Missing User Questions

Important unanswered user questions include:

- Where did my money go this month?
- How am I doing YTD?
- How does this year compare to last year?
- What categories are increasing over time?
- What merchants cost the most this year?
- What is my average monthly spending?
- How much did I spend in each month?
- Which months were the most expensive?
- Are recurring bills increasing?
- Which budget categories are repeatedly over limit?
- What is my projected annual spending?
- Once income exists, what is my YTD income?
- Once savings exists, what is my YTD savings and savings rate?

## 3. Current Data Available Now

Data currently available for first visual reporting MVP (existing system only):

- Transactions
- Transaction splits
- Budget categories
- Recurring bills
- Recurring payment instances
- Credit cards
- Monthly card balances
- Card statements
- Monthly close review status

What can be reported now without income/savings:

- YTD spending
- Monthly spending trend
- Spending by category
- Spending by merchant
- Budget usage trends
- Recurring bills paid/remaining
- Card statement totals by month
- Monthly close completion by month

## 4. Future Data Needed

These metrics depend on future income/savings features and should be deferred until those phases are implemented:

- YTD income
- YTD savings
- Savings rate
- Cash-flow surplus/deficit
- Emergency fund progress
- Net worth
- Account balance trends

This future scope aligns with Phase 17 planning in `docs/income-savings-cash-flow-design.md`.

## 5. Recommended MVP Charts Using Current Data

Low-risk charts that can be built before income/savings exists:

### A) Spending by Category

- Chart type: bar chart or donut chart
- Scope: selected month
- Variant: optional YTD view

### B) Monthly Spending Trend

- Chart type: bar chart by month
- Scope: last 6 or 12 months
- Rule: expense transactions only
- Exclusions: credit card payments and transfers

### C) YTD Spending by Month

- Chart type: monthly bar chart from January through selected month
- Includes: total YTD spending
- Includes: average monthly spending

### D) Top Merchants

- Chart type: horizontal bar chart
- Scope option: selected month and YTD

### E) Budget Usage

- Visualization: progress bars by category
- Grouping: over / near / safe
- Accessibility: do not rely on color only

### F) Recurring Bills Paid vs Remaining

- Visualization: stacked bar or progress summary
- Scope: selected month

### G) Credit Card Statement Balances by Month

- Chart type: trend chart from monthly balances/card statements
- Purpose: debt/payment pressure visibility

### H) Monthly Close Progress

- Visualization: reviewed vs not reviewed by month
- Presentation: compact status timeline

## 6. Recommended Future Charts After Income/Savings Exists

- Income by source
- Income vs spending
- Monthly cash-flow surplus/deficit
- Savings contributions over time
- Savings goal progress
- Emergency fund progress
- Savings rate trend
- Net worth/account balance trend

## 7. YTD Reporting Design

Add a `YTD Review` section in Insights.

Summary cards:

- YTD spending
- Average monthly spending
- Highest spending month
- Top category YTD
- Top merchant YTD
- Number of over-budget categories YTD
- Number of reviewed months
- Card statement total YTD (if useful for household debt pressure context)

Tables/charts:

- YTD spending by month
- YTD spending by category
- YTD top merchants
- Monthly budget overage history
- Monthly close review history

## 8. Previous-Year Comparison Design

Add a `Year-over-Year` comparison section for:

- Current year YTD vs previous year same period
- This month vs same month last year
- Category comparison
- Merchant comparison
- Average monthly spending comparison
- Recurring bill comparison

If prior-year data is missing, show this empty state:

- "Previous-year comparison will appear once you have tracked data for the same period last year."

## 9. Insights Page Structure Recommendation

Recommended Insights sections:

- Monthly Overview
- Spending Breakdown
- Budget Performance
- Trends
- YTD Review
- Year-over-Year
- Future: Income & Savings

Structure recommendation:

- Start with section blocks on one page (headings + cards/charts/tables) instead of a complex tab system.
- Add filters (month window, YTD toggle, category/merchant scope) before introducing tabs.
- Move to tabs only if page length or rendering complexity becomes a clear usability problem.

## 10. Dashboard Chart Recommendation

Dashboard should remain compact and action-focused. Include only small summary visuals:

- Monthly spending mini bar
- Budget pressure progress
- Bills remaining progress
- Monthly close progress
- Future cash-flow status card

Heavy visual analysis should live in Insights, not Dashboard.

## 11. Technical Approach

Comparison:

- CSS-only progress bars
  - Pros: lightweight, accessible, low risk
  - Cons: limited for multi-series trends
- Simple SVG custom charts
  - Pros: precise control, no new dependency, good for bars/lines
  - Cons: more implementation effort than library usage
- Lightweight chart library
  - Pros: faster advanced interactions
  - Cons: dependency, maintenance, bundle growth
- Full chart library
  - Pros: rich feature set
  - Cons: highest complexity and bundle cost

MVP recommendation:

- Use CSS progress bars for budget/bills/monthly close summaries.
- Use simple custom SVG or accessible div-based bar charts for first version.
- Defer chart-library adoption until interaction complexity justifies it.

No chart library should be added in Phase 18.

## 12. Accessibility Requirements

Charts and visual summaries must:

- Include text summaries.
- Not rely on color alone.
- Show labels and values.
- Work on mobile.
- Provide table/list fallback where needed.
- Include screen-reader-friendly descriptions.
- Avoid tiny unreadable axis labels.

## 13. Data Correctness Rules

- Exclude credit card payments from spending totals if purchases are already tracked.
- Refunds reduce spending, not income.
- Transfers should not count as spending.
- Split transactions should count by split category.
- Recurring generated transactions should not double-count bills if already represented elsewhere.
- Inactive cards should not affect active-card trend totals unless explicitly selected.

## 14. Edge Cases

- Partial-year tracking
- Missing prior-year data
- Irregular months
- Imported historical transactions
- Refunds larger than spending
- Split transactions across categories
- Uncategorized transactions
- Duplicate merchants with spelling differences
- Category renamed over time
- Credit card payment double counting
- Recurring bill generated transaction double counting
- Months with no data
- Households that start mid-year

## 15. Other Missing Finance-Tracker Areas

- Income tracking
- Savings tracking
- Cash-flow dashboard
- Account balance snapshots
- Net worth tracking
- Debt tracking beyond credit cards
- Bill calendar
- Cash-flow forecasting
- Recurring subscription detection
- Merchant/category rules
- Mobile chart optimization

## 16. Recommended Implementation Phases

- Phase 19: Insights visual charts MVP using existing data
- Phase 20: YTD spending and historical Insights
- Phase 21: Previous-year comparison
- Phase 22: Income tracking MVP
- Phase 23: Savings goals MVP
- Phase 24: Dashboard cash-flow summary
- Phase 25: Net worth/account balance snapshots

## 17. Risks

- Chart clutter
- Misleading YTD totals with incomplete data
- Double counting card payments
- Confusing refunds with income
- Making Dashboard too busy
- Mobile readability
- Accessibility gaps
- Dependency bloat
- Pretty charts that do not guide action

## 18. Acceptance Criteria for Future Visual Reporting MVP

Implementation should be considered done when:

- Insights has at least 3 useful visual sections.
- YTD spending can be reviewed.
- Charts have accessible text summaries.
- No double-counted payment totals.
- Mobile layout is readable.
- Empty states are helpful.
- No schema changes are required for first chart MVP.

## Cross-Phase IA Note

For page-level organization and Dashboard/Insights/Cash Flow responsibility boundaries, see the Phase 19 reporting IA plan in `docs/reporting-information-architecture.md`.

## Phase 21 Status Note

- YTD Review MVP has started in Insights using existing transaction/budget data (no chart library, no schema changes).
- Implemented scope includes YTD summary cards and YTD month/category/merchant breakdown sections.
- Previous-year comparison MVP has started with same-month and same-period YTD comparisons plus category/merchant delta views.
