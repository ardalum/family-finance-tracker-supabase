# Full Product UX / IA Audit

Date: 2026-05-18  
Scope: WalletFlow Phase 64 product UX and information architecture audit (updated with Phase 65 status)

## 1) Executive summary

### What is working

- Core finance workflows are implemented and reachable: Dashboard, Cards, Budget, Spending, Bills, Insights.
- Secondary finance workflows are present and functional: Calendar (FullCalendar), Financial Position, Income, Savings, Accounts, Liabilities, Net Worth.
- Browser hash navigation and Back/Forward behavior are now stable.
- Release and QA documentation coverage is broad.

### What is confusing

- Dashboard cash-flow summary mixes concepts: it subtracts spending impact from income even when card purchases have not become cash outflows yet.
- Daily tools are split across Dashboard quick actions and Account menu Tools, increasing navigation ambiguity.
- Account menu feels overloaded for a standard account affordance.
- Insights is data-rich but visually repetitive (heavy horizontal bars), reducing scanability and actionability.

### What is release-blocking

- Cash-flow semantics and copy were materially misleading for users who rely on credit cards for spending (addressed in Phase 65 with Financial Pulse summary framing).
- Product navigation model is not yet cohesive enough for confidence at release-candidate positioning.
- RC readiness should be blocked until UX/IA findings are triaged and execution priority is agreed.

### What should be redesigned later

- Dashboard information hierarchy (cash vs budget vs obligations).
- Information architecture for daily workflows vs tools/settings.
- Insights visual system (chart type mix + decision support cards).
- Data-entry acceleration patterns (quick-add and recurrence shortcuts).

## 2) UX principles evaluation

### Frictionless Data Entry

- Strengths:
  - Most forms are complete and safe-normalized.
  - Amount input overwrite behavior improved (focus-select fixes already shipped).
- Gaps:
  - No global quick-add.
  - Repeated entries require too many context switches.
  - Mobile speed paths for frequent transaction logging are limited.

### Low Cognitive Load Dashboard

- Strengths:
  - Alerts and quick actions are visible.
  - Month context is clear.
- Gaps:
  - Cash-flow label and formula do not match common mental models for card-based households.
  - Too many concepts are co-located without clear separation (spending usage, cash position, obligations).

### Privacy & Trust Signals

- Strengths:
  - Data/privacy pages and destructive-action safeguards exist.
  - Backup/restore warnings are present.
- Gaps:
  - Account menu combines tools and trust surfaces, which can dilute trust cues.
  - Session/security context is present but should move to Account Settings, not menu-level prominence.

### Actionable Intelligence

- Strengths:
  - Insights contains category/merchant/budget/YTD/YoY/net-worth logic.
- Gaps:
  - Visual language is chart-type narrow.
  - Too few direct “what should I do next?” outputs (recommendation cards, trend warnings).

## 3) Dashboard audit

Current Dashboard does not reliably answer in under 3 seconds:

- How much do I have?
  - Partially answered across Financial Position and Accounts, not centered in Dashboard.
- How much have I spent?
  - Answered well via spending totals and alerts.
- What do I have left to spend?
  - Ambiguous due to cash-flow formula semantics.
- What needs action?
  - Answered well via alerts and due/over-budget surfaces.

Cash-flow issue summary:

- Current formula in code: `Income - spending - recurring remaining - savings`.
- This treats all spending as immediate cash outflow even when transaction type is card expense.
- Card-payment obligations are explicitly excluded from the metric, creating a conceptual mismatch.
- Phase 65 status: replaced with grouped `Financial Pulse` summary that separates cash position, budget usage, obligations, savings, and planned cushion language.

Recommended Dashboard decomposition:

- Cash position
- Budget/spending usage
- Upcoming obligations
- Card payments due
- Savings progress
- Alerts/action items

## 4) Cash-flow model audit

Inspected:

- `src/features/dashboard/components/DashboardCashFlowSummary.jsx`
- `src/features/dashboard/dashboardCashFlow.js`
- spending model in `src/features/spending/spendingService.js`
- credit card status model in `src/features/creditCards/creditCardStatus.js`
- recurring model in `src/features/recurring/recurringService.js`
- income model in `src/features/income/incomeService.js`
- savings model in `src/features/savings/savingsService.js`
- cash account snapshot model in `src/features/accounts/accountsService.js`

Observed behavior:

- Cash-flow summary text admits unpaid card balances are excluded.
- Spending total includes expense/refund/adjustment net impact, but payments/transfers/income have zero impact in spending metrics.
- This is valid for budget analysis, but not sufficient for a “cash left” label.

Recommended terminology:

- Avoid `Estimated leftover` when mixing spending and cash obligations.
- Candidate replacements:
  - `Budget remaining` (if budget framing)
  - `Planned cash cushion` (if forecast framing)
  - `Available after planned bills` (if obligations framing)
  - `Cash outlook` (if broad summary framing)

Recommended model rules:

- Card purchase affects spending and budget usage.
- Card payment affects cash.
- Recurring unpaid bills affect upcoming cash obligations.
- Income increases cash outlook.
- Savings contributions reduce available cash but are not spending.

## 5) Navigation / information architecture audit

Current state audit:

- Main nav is stable and compact.
- Dashboard quick actions contain both core tasks and secondary tools.
- Account menu includes both trust/account items and daily finance tools.
- Footer links are clean and standard.
- Secondary views and hash navigation are technically sound.

Option review:

- Option A (recommended now): Keep current main nav pattern and introduce a dedicated `More/Tools` container outside account menu for non-primary workflows.
- Option B: Taxonomy-driven nav (`Track/Plan/Pay/Reports/More`) is promising but higher migration and learning cost.
- Option C: Sidebar + mobile bottom nav requires larger structural redesign and should follow IA agreement.

Recommended direction: **Option A** (implemented in Phase 66)

- Why:
  - Lowest risk to existing mental model.
  - Preserves current primary nav names.
  - Removes overloaded account menu role.
  - Enables staged migration of tools out of account menu without major UI breakage.
  - Phase 66 status: main nav remains unchanged; dedicated `Tools` secondary surface added; account menu now focuses on account/household/privacy/support actions.

## 6) Account menu audit

Findings:

- Menu is not extreme in item count, but role clarity is mixed.
- “Session details” concepts belong deeper in settings/security, not as top-level confidence signals.
- Daily tools (Calendar/Financial Position) inside account menu blur account vs workflow boundaries.

Recommendations:

- Account menu should center on:
  - Profile / Account
  - Household
  - Settings
  - Privacy & Data
  - Help
  - Sign out
- Move “session active” emphasis into Account Settings > Security.
- Move daily tools to a dedicated app-level Tools/More surface when IA changes land.
- Keep Backup & Restore under Data/Privacy or Settings, not mixed with daily planning tools.

## 7) Data-entry friction audit

Flows reviewed:

- spending transactions
- income entries
- recurring bills
- card monthly balances
- budget categories
- savings contributions
- account snapshots
- liability snapshots

Friction themes:

- Repeated entry tasks still require multiple taps and view switching.
- No global quick-add command path.
- Limited “duplicate recent” support for common transactions.
- No central acceleration pattern for frequent household logging.
- Mobile data entry works, but high-frequency logging ergonomics can improve.

Phase 68 update:

- Partially addressed: global `Quick Add` transaction entry now exists with fast amount-first modal flow, validation, and recent-merchant shortcuts sourced from existing transactions.
- Remaining work: extend Quick Add pattern to additional entry types (income, bills, savings, snapshots) and add deeper duplicate/template acceleration.

Recommendations:

- Add global `Quick Add` entry point.
- Add quick transaction modal (date/category/merchant/amount first).
- Add recent merchants/categories shortcuts.
- Add duplicate-last-transaction behavior.
- Expand recurring templates for fast reuse.
- Keep smart default date/month behavior.
- Keep keyboard-first amount entry and large mobile targets.

## 8) Insights audit

Inspected:

- `src/features/insights/components/Insights.jsx`
- `src/features/insights/insightsChartData.js`
- `package.json` (`recharts` already installed)

Current state:

- Insights relies heavily on horizontal bar-style visualizations.
- Content breadth is good, but visual grammar is repetitive and less intuitive for trend interpretation.

Recommended future visuals:

- donut/pie: spending by category
- vertical bar: monthly spending comparison
- line chart: spending over time
- stacked bar: budget vs actual
- net worth line chart
- income vs spending trend
- cash outlook trend
- merchant concentration warning
- subscription creep / recurring bill change indicators
- actionable insight cards with next-step links

## 9) Privacy & trust audit

Findings:

- Trust controls exist but are distributed across account menu, backup UI, and settings pages.
- Copy quality is generally safe, but trust signaling can be more explicit and less technical.

Recommendations:

- Introduce clearer privacy status summary in a single trusted location.
- Group export/delete/reset and backup cautions under a consistent Data & Privacy area.
- Keep restore warnings concise but stronger on irreversible merge consequences.
- Standardize language tone across account, privacy, and destructive-action screens.

## 10) Release recommendation

### Is app ready to tag RC?

- **Not yet for final confidence positioning.**
- Technical quality is strong, but UX/IA semantics and navigation clarity need triage and prioritization before claiming final RC readiness.

### Release blockers

- Missing agreed IA direction for where daily tools live (account menu vs app-level tools).

### High priority before RC

- Finalize terminology and model framing for Dashboard financial summary.
- Approve IA direction (recommended Option A) and account-menu role boundaries.
- Define minimum Insights visual redesign scope for actionable clarity.

### Post-RC improvements

- Quick Add MVP and high-frequency entry acceleration.
- Expanded chart suite and guided insight actions.
- Privacy/trust copy polish pass.

### Future enhancements

- Predictive cash forecasting and card-payment scheduling intelligence.
- Richer household planning workflows and deeper analytics automation.
