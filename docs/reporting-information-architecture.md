# Reporting Information Architecture and Dashboard/Insights UX Plan (Phase 19)

Date: 2026-05-17  
Project: Spedger / Family Finance Tracker  
Scope: UI/UX information architecture planning only (no implementation in this phase)

## 1. Problem Statement

Spedger's Dashboard is effective for monthly status, but it cannot safely carry every future feature without becoming cluttered and confusing. Upcoming scope includes:

- Monthly alerts
- Monthly Close Checklist
- Spending charts
- YTD reporting
- Previous-year comparison
- Income
- Savings
- Cash flow
- Net worth

If all of this is pushed into one page, users lose clarity on where to act versus where to analyze. The app needs clear page responsibilities before implementing charts and income/savings features.

## 2. Core Page Responsibilities

### Dashboard

- Month health snapshot
- Alerts
- Quick actions
- Monthly Close Checklist
- Compact cash-flow summary in the future

### Insights

- Spending analysis
- Charts
- YTD reporting
- Previous-year comparison
- Category/merchant trends
- Historical reports

### Cards

- Credit card setup
- Monthly balances
- Statement/payment tracking

### Budget

- Monthly category plans
- Budget usage

### Spending

- Transaction entry and review

### Bills

- Recurring bill templates and monthly bill tracking

### Future Cash Flow

- Income
- Savings
- Monthly surplus/deficit
- Emergency fund progress
- Cash account snapshots if implemented

## 3. Recommended Navigation Evolution

Evaluate options:

- Keep current nav unchanged
- Add Cash Flow later
- Add Reports/Insights split
- Add Yearly Review section

Recommendation:

- Keep current nav now.
- Add `Cash Flow` only after income/savings MVP functionality exists.
- Keep `Insights` as the reporting hub for charts, YTD, and year-over-year analysis.

## 4. Dashboard Layout Recommendation

Recommended Dashboard order:

- Month selector
- Health summary cards
- Future Cash Flow summary card
- Quick actions
- Monthly Close Checklist
- Top alerts
- Workspace: Attention / Activity / Full View

What should not go on Dashboard:

- Large charts
- Detailed YTD tables
- Previous-year comparison tables
- Deep merchant/category analytics

## 5. Insights Layout Recommendation

Recommended Insights sections:

- Monthly Overview
- Spending Breakdown
- Budget Performance
- Trends
- YTD Review
- Year-over-Year
- Future Income & Savings

Recommendation:

- Use section blocks first.
- Introduce tabs later only if page length becomes a usability problem.

## 6. Future Cash Flow Page Recommendation

Future `Cash Flow` page responsibilities:

- Income sources
- Income entries
- Savings goals
- Savings contributions
- Monthly surplus/deficit
- Savings rate
- Emergency fund progress

Navigation note:

- `Cash Flow` should not be added to main navigation until real MVP functionality exists (not placeholder UI).

## 7. UI Component Strategy

Recommended reusable components (future implementation):

- `MetricCard`
- `ChartCard`
- `SectionHeader`
- `EmptyState`
- `TimeRangeSelector`
- `ComparisonBadge`
- `ProgressBar`
- `HorizontalBarChart`
- `MiniTrendBar`

Do not implement these in Phase 19.

## 8. Data/Time Range UX

Common filter ranges:

- Selected month
- YTD
- Last 6 months
- Last 12 months
- Previous year
- Custom range later

Filter ownership:

- Dashboard: month only
- Insights: month + range
- Future Cash Flow: month + year

## 9. Mobile UX Rules

- No wide tables without mobile card/list fallback.
- Charts must keep labels readable at small widths.
- Keep Dashboard compact and action-first.
- Use stacked cards on mobile.
- Avoid tab overload.
- Provide text summary under charts.

## 10. Risks

- Dashboard clutter
- Duplicate metrics across pages
- Confusing Income/Savings with Spending/Budget
- Chart overload
- Navigation bloat
- Users not knowing where to go

## 11. Recommended Implementation Sequence

- Phase 20: Insights charts MVP using existing data
- Phase 21: YTD spending and historical reporting
- Phase 22: Income tracking MVP
- Phase 23: Savings goals MVP
- Phase 24: Dashboard cash-flow summary
- Phase 25: Cash Flow page/nav promotion
- Phase 26: Net worth/account balance snapshots
