# Spedger

Spedger is a Vite + React + Supabase household finance tracker for managing family finances in one place.

Current app experience includes:

- Overview dashboard
- Money Center for income, accounts, and financial position
- Transactions
- Budgets
- Cards & Debt
- Bills
- Savings Goals
- Insights
- Settings
- Help Center
- Supabase Auth and household data model
- GitHub Pages deployment

Money Center consolidates Income, Accounts, and Financial Position.

## Project Docs

- `docs/local-workflow.md` for local setup and day-to-day workflow
- `docs/finance-model/cash-position-register-model.md` for the Cash Position and account register model decision
- `docs/frontend-architecture-plan.md` for frontend architecture notes
- `docs/auth-session-qa.md` for auth/session QA checks
- `docs/production-qa-checklist.md` for release smoke testing
- `docs/release-readiness-checklist.md` for final pre-release checks
- `docs/release-tag-deployment-handoff.md` for deploy handoff details

## Tech Stack

- Vite
- React
- Tailwind CSS
- Supabase (Auth, Postgres, RLS, Edge Functions)
- Lucide icons
- Node.js >= 24

## Install

Use Node.js 24+ for local development. This repo includes `.nvmrc`, `.npmrc`, and `package.json` engines guidance.

Install dependencies:

```bash
npm install
```

For a lockfile-clean install:

```bash
npm ci
```

## Environment Variables

Create local environment values from the example file:

```bash
cp .env.example .env.local
```

PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Required Vite frontend variables:

```text
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Use `.env.local` for local values and never commit secrets.

Only use the Supabase anon key in frontend code. Never expose `SUPABASE_SERVICE_ROLE_KEY` in Vite env vars, frontend source, or browser-delivered config.

## Local Development

Start the app:

```bash
npm run dev
```

If dependencies or Vite cache become stale:

```bash
npm run dev -- --force
```

Clean generated local folders before rebuilding:

```bash
npm run clean
```

## Build and Checks

Build production assets:

```bash
npm run build
```

Run tests:

```bash
npm run test:run
```

Required project verification before PR:

```bash
npm run verify
```

`npm run verify` runs formatting check, build, tests, and lint.

Optional clean verification pass:

```bash
npm run verify:clean
```

Preview the production build locally:

```bash
npm run preview
```

## Supabase Setup

Apply SQL migrations in `supabase/migrations` to your target Supabase project before production use.

Recommended path:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase db push
```

Required platform capabilities include:

- Supabase Auth
- Row Level Security policies from migrations
- Household setup and profile tables/policies
- Security hardening migrations

If migration history mismatch appears, do not reset production data. Compare local and remote migration history and use Supabase migration repair carefully before rerunning `supabase db push`.

## Edge Functions

This app uses Supabase Edge Functions for destructive account/household workflows:

- `supabase/functions/delete-account`
- `supabase/functions/delete-household-finance-data`

Deploy with Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase functions deploy delete-account
npx supabase functions deploy delete-household-finance-data
```

If function code changes, redeploy changed functions before production smoke testing.

Edge Function secrets:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ALLOWED_ORIGINS
```

`ALLOWED_ORIGINS` is optional but recommended as a comma-separated allowlist.

Keep `SUPABASE_SERVICE_ROLE_KEY` only in server-side Edge Function secrets.

## Backup and Import Safety

Supabase JSON backups and Excel exports contain sensitive household finance data. Store exported files securely and import only trusted files.

Use non-production test accounts for destructive workflow checks, including risky imports, household finance deletion, and account deletion.

## Deploy to GitHub Pages

This repository deploys `dist` to GitHub Pages from `main` via `.github/workflows/deploy.yml`.

Required GitHub repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Release flow:

1. Push to `main`.
2. Confirm `Deploy Spedger to GitHub Pages` succeeds in GitHub Actions.
3. Confirm `Verify` passed (`npm run verify`).
4. Run production smoke checks from `docs/production-qa-checklist.md` on the deployed site.

## Production Checklist

- [ ] `npm run verify` passes locally.
- [ ] `npm run dev` starts locally when browser behavior should be checked.
- [ ] Supabase migrations are applied to production.
- [ ] RLS is enabled on household finance tables.
- [ ] `VITE_SUPABASE_URL` is configured in frontend hosting.
- [ ] `VITE_SUPABASE_ANON_KEY` is configured in frontend hosting.
- [ ] No frontend code or env vars expose `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] `delete-account` Edge Function is deployed.
- [ ] `delete-household-finance-data` Edge Function is deployed.
- [ ] Changed Edge Functions are redeployed.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` exists only as an Edge Function secret.
- [ ] `ALLOWED_ORIGINS` is configured for Edge Functions.
- [ ] Supabase Auth site URL and redirect URLs are configured.
- [ ] Email confirmation and password reset flows are configured/tested.
- [ ] Signup, household setup, export/import, and destructive flows are tested in non-production accounts.
- [ ] `docs/production-qa-checklist.md` is completed for release.
- [ ] `.env.local` is not committed.
