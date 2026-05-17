# Product UX Audit After Finance Expansion (Phase 39)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Scope: UX/product audit after expansion to income, savings, accounts, liabilities, net worth, and expanded Insights reporting

## 1. Product Structure

Current structure is directionally sound:

- Dashboard remains the action center.
- Insights remains the reporting center.
- Income, Savings, Accounts, Liabilities, and Net Worth are available as secondary tools.
- Monthly Close acts as cross-workflow review glue.
- Account menu Tools + Dashboard quick actions provide alternate entry paths.

Current concern:

- Financial position tools now represent a large secondary surface area. They are functional, but their conceptual grouping is not yet explicit in-product.

## 2. Navigation and Discoverability

Findability assessment:

- Income: discoverable via Dashboard quick action and Account menu Tools.
- Savings: discoverable via Dashboard quick action and Account menu Tools.
- Accounts: discoverable via Dashboard quick action and Account menu Tools.
- Liabilities: discoverable via Dashboard quick action and Account menu Tools.
- Net Worth: discoverable via Dashboard quick action and Account menu Tools.

Risk:

- These tools are discoverable for engaged users, but still feel "off-main-path" for new users expecting them in primary navigation.

Recommendation:

- Keep current primary nav unchanged now.
- Continue using quick actions and Tools entries.
- Reassess main-nav promotion only after usage confirms ongoing monthly reliance.

## 3. Dashboard UX

Strengths:

- Still answers "what needs attention now?" through alerts, quick actions, and Monthly Close.
- Cash-flow summary is compact and actionable.

Risks:

- Quick actions are becoming dense.
- Dashboard can feel long on mobile when cards, checklist, and alerts all expand.

Guidance:

- Keep Dashboard focused on action and status.
- Avoid adding heavy analytics blocks to Dashboard.

## 4. Insights UX

Strengths:

- Insights now covers monthly visual summaries, YTD, year-over-year, and net worth trends.

Risks:

- Section count is high and page length can become fatiguing.
- Scanability can degrade as more trend/report sections are added.

Guidance:

- Keep section-block model for now.
- Add lightweight section anchors or jump links if additional reporting layers are added.
- Reserve tabs for later only if section growth materially harms readability.

## 5. Monthly Close UX

Strengths:

- Checklist provides a practical month-end operating flow.
- Manual checks plus optional reviews support real household workflows.

Risks:

- Required vs optional semantics may be missed by skimming users.
- Checklist feels heavier as optional review prompts expand.

Guidance:

- Keep new balance/debt/net-worth prompts optional/manual.
- Keep copy explicit that missing snapshot data does not block close.

## 6. Secondary Tools UX

### Income

- Purpose clarity: good.
- Empty states: clear.
- CRUD workflow: clear and low risk.
- Month behavior: predictable.
- Confusion risk: moderate for users expecting income to affect spending totals.

### Savings

- Purpose clarity: good.
- Empty states: clear.
- CRUD workflow: clear.
- Month behavior: predictable.
- Confusion risk: moderate between savings contributions and spending.

### Accounts

- Purpose clarity: good.
- Empty states: clear.
- CRUD workflow: clear.
- Month behavior: predictable.
- Confusion risk: moderate between snapshots and transactions.

### Liabilities

- Purpose clarity: mostly good.
- Empty states: clear.
- CRUD workflow: clear.
- Month behavior: predictable.
- Confusion risk: elevated around credit-card double counting.

### Net Worth

- Purpose clarity: good with current helper copy.
- Empty states: clear.
- Month behavior: clear.
- Confusion risk: moderate around what is excluded (non-snapshot assets, statement balances).

### Backup

- Purpose clarity: acceptable.
- Confusion risk: legacy local backup still requires careful wording to avoid Supabase-export confusion.

### Settings

- Purpose clarity: good.
- Confusion risk: low.

## 7. Mobile UX

Observed UX risks to monitor:

- Navigation density in account menu Tools list.
- Dashboard scroll length with checklist + alerts + quick actions.
- Reporting section length in Insights.
- Form ergonomics in data-entry tools with many fields.

Current direction:

- Card-based layouts and responsive sections remain workable.
- No urgent architecture change required this phase.

## 8. Copy and Terminology Consistency

Consistency status:

- Strong overall, with minor terminology drift.

Noted drift areas:

- "Liabilities" vs "Debt"/"Debts" naming.
- "Bills" vs "Recurring Payments" wording depending on page/header context.
- "Accounts" vs "Cash Accounts" precision in some copy.

Phase 39 safe fix applied:

- Account menu label updated from `Debts` to `Liabilities / Debt` for clearer alignment with page naming and searchability.

## 9. Recommended UX Improvements

### Immediate safe fixes

- Keep terminology alignment updates in copy-only changes.
- Preserve explicit helper copy that snapshots are separate from transactions.
- Preserve explicit helper copy that optional Monthly Close review items do not block close.

### Next-phase fixes

- Add lightweight in-page anchors/jump links for long Insights pages.
- Improve grouping hints for "financial position" tools (Income/Savings/Accounts/Liabilities/Net Worth) without changing main nav.
- Add concise onboarding hints for first-time tool discovery in Account menu or Dashboard quick actions.

### Later redesign ideas

- Introduce a dedicated "Financial Position" hub once usage justifies consolidation.
- Revisit Dashboard quick-action density with progressive disclosure patterns.
- Consider elevating Cash Flow to primary nav only after sustained user reliance and clearer long-term IA.

## 10. Recommended Future Information Architecture

Recommendation for now:

- Keep current main nav unchanged: Dashboard, Cards, Budget, Spending, Bills, Insights.
- Keep Insights as the reporting hub.
- Keep Income/Savings/Accounts/Liabilities/Net Worth as secondary tools with dual entry points.

Future recommendation:

- Introduce a conceptual secondary "Financial Position" grouping first (copy/grouping level).
- Evaluate promotion of Cash Flow or Net Worth to main nav only when:
  - repeated monthly usage is high,
  - user testing shows discoverability pain,
  - Dashboard and Insights remain scoped and uncluttered.

## Audit Summary

- The post-expansion product is coherent and usable, but IA pressure is increasing.
- Main near-term risk is not missing features; it is discoverability, terminology drift, and progressive clutter.
- No major navigation restructure is required in Phase 39.
- Copy consistency, optional checklist guidance, and reporting scanability should be the next UX priorities.

## Phase 40 Note

- The recommended next IA improvement is now documented as a dedicated **Financial Position hub** design in `docs/financial-position-hub-design.md`.
- This hub is intended to consolidate secondary finance-position workflows (Income, Savings, Accounts, Liabilities, Net Worth) without changing primary nav yet.

## Phase 41 Note

- Financial Position hub MVP is now implemented as a secondary page and discoverable from Dashboard quick actions and Account menu Tools.
- Main nav remains unchanged; Dashboard and Insights responsibilities remain intentionally separate.

## Phase 42 Note

- Financial Position hub UX hardening is now in place for clearer missing-data, loading, and error communication.
- Remaining IA concerns are unchanged:
  - dashboard quick-action density should be monitored
  - account-menu tool sprawl may need later consolidation
  - hub should stay secondary until adoption data supports any nav promotion

## Phase 43 Note

- Dashboard quick actions are now consolidated around Financial Position to reduce quick-action density.
- Dashboard keeps a compact action set focused on routine updates:
  - Update card balances
  - Add transactions
  - Open recurring bills
  - Review budget
  - Financial Position
- Income/Savings/Accounts/Liabilities/Net Worth remain available as detailed pages via Financial Position and Account menu Tools.
