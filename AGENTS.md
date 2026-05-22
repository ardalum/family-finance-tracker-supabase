# AGENTS.md

## Project

App name: Spedger

Spedger is a household/family finance tracker built with Vite, React, Tailwind CSS, and Supabase.

The app helps households track:

- Overview/dashboard
- Money Center
- Transactions
- Budgets
- Cards & Debt
- Bills
- Savings Goals
- Insights
- Settings
- Help Center

Money Center consolidates:

- Income
- Accounts
- Financial Position

## Tech stack

- Vite
- React
- Supabase
- Tailwind CSS
- Lucide icons
- Node.js >= 24

## Required commands

Before starting work, inspect the current branch and status:

```bash
git status
git branch --show-current
```

For validation, use:

```bash
npm run format
npm run verify
```

`npm run verify` is the required final check before a PR.

It runs formatting check, build, tests, and lint.

## Git workflow

- Work on the current requested branch unless instructed otherwise.
- Do not switch branches unless the user asks.
- Do not push unless the user asks or the prompt explicitly says to push.
- Do not force push unless the user explicitly approves it.
- Do not rewrite history unless instructed.
- Keep commits focused and small.
- Use clear commit messages.

Recommended commit message style:

- Fix ...
- Add ...
- Redesign ...
- Polish ...
- Restore ...

## Product rules

Do not introduce fake or no-op features.

If a button, link, card, row, menu item, chevron, or icon appears clickable, it must either:

- perform a real action,
- navigate to a real page,
- open a real modal,
- expand real content,
- or be clearly disabled/marked coming soon.

Do not add dead chevrons, fake action menus, fake support flows, fake reports, or fake dashboards.

## Design system rules

Match the current Spedger redesign.

Use:

- warm off-white app background
- white/soft cards
- rounded cards
- subtle borders and shadows
- deep navy primary buttons
- muted secondary text
- green for positive/safe states
- amber for caution/pending states
- red only for danger/error/overdue/over-budget states
- Lucide-style icons
- consistent spacing and typography

Avoid:

- raw unstyled tables
- harsh all-red UI
- duplicate page headers
- cluttered inline forms
- inconsistent dropdowns/popovers
- overflowing cards
- horizontal scrolling on desktop unless unavoidable for wide data tables

## Design references

Use the current redesigned app pages as the source of truth:

- Overview
- Money Center
- Transactions
- Budgets
- Cards & Debt
- Bills
- Goals
- Insights
- Settings
- Help Center

Do not invent a brand-new style unless the user explicitly asks.

If the user provides mockup images or screenshots in a prompt, treat those images as the task-specific visual source of truth.

## Responsive design rules

All redesigned pages must remain usable on desktop, tablet, and mobile.

Desktop:

- Use the full app shell with sidebar, topbar, main content, and right rail where appropriate.
- Avoid horizontal scrolling unless the content is truly wide data.

Tablet:

- Cards should wrap cleanly.
- Right rails should stack below main content if space is limited.

Mobile:

- Content should stack vertically.
- Cards should remain readable.
- Tables should become compact lists or scroll only when unavoidable.
- Primary actions should remain reachable.
- Modals should fit small screens.
- Sidebar/mobile drawer access must remain usable.
- Do not hide critical actions that are only available on desktop.

Manual QA should include:

- desktop width
- tablet-like width
- mobile-like width

## Layout rules

The app uses the redesigned shell with:

- left sidebar
- topbar
- household selector
- month selector
- search
- notifications
- account menu
- page-aware primary action

Do not duplicate the page title inside page content if the shell already renders the title and description.

Use right rails where appropriate for:

- summaries
- status cards
- quick actions
- tips
- related workflows

## Modal and form rules

Prefer modals for add/edit workflows in redesigned pages.

Do not show multiple add/edit forms inline on a dashboard-style page unless the user explicitly asks for inline editing.

Forms should:

- have clear titles
- use Save/Cancel controls
- close after successful save
- preserve validation
- not reset unrelated page state
- not change financial calculations unless required

## Money Center rules

Money Center is the consolidated page for:

- Income
- Accounts
- Financial Position

Use `financial-position` as the canonical route/view id.

The following aliases should continue to land on Money Center:

- income
- accounts
- financial-position

Do not add separate visible sidebar items for Income, Accounts, or Financial Position unless the user asks.

Money Center add actions:

- Add income entry
- Add income source
- Add account
- Add balance snapshot

Income rules:

- Income is separate from spending.
- Income affects Cash Position only when deposited into a tracked account.
- Outside/untracked income should save but should not affect Cash Position.
- Not deposited yet should not affect Cash Position.

Account rules:

- Tracked accounts are used for Cash Position.
- Balance snapshots remain the actual balance record.
- Do not silently change account balances without using existing account/snapshot/movement logic.

Financial Position rules:

- Cash assets are positive.
- Debts/liabilities should be clearly labeled as obligations.
- Net position is assets minus debts/liabilities.

## Cash Position rules

Cash Position should reflect tracked cash/bank account state using existing app logic.

Do not treat these as cash available:

- credit card available credit
- unpaid card balances
- outside/untracked accounts
- pending/not-deposited income

Credit card purchases affect spending/budgets, but they do not reduce Cash Position until the card is paid from a tracked account.

Recurring bill payments reduce Cash Position only when paid from a tracked account.

## Overview rules

The Overview page should remain a dashboard, not a form page.

The top-left card should keep the approved dashboard-style cash-flow/income-vs-spending visual:

- compact metric layout
- chart or clean empty trend state
- one header action such as View cash flow
- no inline Add income/Add transaction buttons inside that card

Overview actions should route to real workflows:

- View cash flow should route to Money Center
- View budgets should route to Budgets
- View bills should route to Bills
- View cards should route to Cards & Debt
- View goals should route to Goals

## Sidebar rules

The sidebar should show:

- Overview
- Money Center
- Transactions
- Budgets
- Cards & Debt
- Bills
- Goals
- Insights
- Family Activity, disabled/coming soon
- Settings

Help Center should live in the bottom Support section, not duplicated in the main nav.

Expanded sidebar branding should show:

- Spedger logo
- Spedger name
- Family money center tagline
- collapse button in the branding row

Collapsed sidebar should show:

- compact logo
- expand button
- icon-only nav
- Help Center support icon at the bottom

## Help Center rules

Help Center should use the redesigned app style.

Keep existing help content available:

- concepts guide
- troubleshooting checklist
- support guidance
- workflow guidance

Avoid fake support/ticket behavior:

- If no backend exists, mark ticket/feedback as coming soon or route to email support.
- Do not add fake live support status unless clearly static/help text.

## InfoTooltip rules

Use the shared `InfoTooltip` for card explanations.

Tooltips must:

- be readable
- avoid clipping behind the sidebar
- stay viewport-safe
- work on hover/focus/click where supported
- close on Escape/outside click where supported

Do not reintroduce absolute positioning that clips tooltip text near the sidebar.

## Accessibility

Use semantic buttons and links.

Requirements:

- buttons need accessible names
- icon-only buttons need `aria-label`
- disabled items should be clearly disabled
- modals need accessible titles and close controls
- dropdowns should close on selection and Escape
- tabs should have clear active state
- forms should have labels or accessible labels

## Testing rules

When changing UI behavior, update tests to match the approved current design.

Do not revert approved redesign work just to satisfy stale tests.

Prefer tests that verify:

- visible user behavior
- accessible labels/roles
- important route/action wiring
- no inline forms when modals are expected
- no duplicate nav/page items
- no dead/no-op actions

Before finishing, run:

```bash
npm run format
npm run verify
```

## Encoding rules

Do not introduce mojibake or broken characters.

Avoid:

- �
- ?
- ’
- “
- �
- �
- �

Use normal characters:

- �
- �
- '
- "
- ***

## Security and data rules

Do not log:

- Supabase tokens
- reset links
- auth session tokens
- private household data
- environment secrets

Do not expose service role keys.

Do not change RLS, schema, or migrations unless the user explicitly requests backend/database work.

## Environment rules

Use `.env.local` for local Vite environment variables.

Only Vite-exposed browser variables should use the `VITE_` prefix.

Never commit real secrets.

## Completion checklist

Before reporting completion:

- Confirm changed files.
- Confirm no unrelated files were edited.
- Confirm `npm run format` passed.
- Confirm `npm run verify` passed.
- Mention any manual browser checks needed.
- Mention if anything was intentionally left out of scope.

Run:

```bash
npm run format
npm run verify
```

Commit message:

`Add AGENTS.md`
