# Credit Card Tracker Supabase

A Vite + React personal finance tracker backed by Supabase. The app supports Supabase Auth, household setup, household profiles, credit card tracking, monthly card balances, budgets, spending, recurring payments, dashboard views, Supabase JSON backup/import, Excel export, and account deletion through a Supabase Edge Function.

## Project Docs

- `docs/local-workflow.md` covers Node version, install commands, local checks, pull request routine, and project checks.
- `docs/frontend-architecture-plan.md` tracks the frontend architecture cleanup plan.
- `docs/auth-session-qa.md` contains the authentication and session QA checklist.

## Install

Use Node 24 for local development. The project includes `.nvmrc`, `.npmrc`, and `package.json` engine settings so local installs and project checks use the same major Node version.

Install dependencies:

```powershell
npm.cmd install
```

On macOS/Linux or a shell where npm scripts are enabled:

```bash
npm install
```

For a clean install that matches the lockfile:

```bash
npm ci
```

## Environment Variables

Copy the example environment file and fill in the local values:

```bash
cp .env.example .env.local
```

On PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Required frontend variables:

```text
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Do not commit `.env.local`. It is already listed in `.gitignore`.

Only use the Supabase anon key in the frontend. Never put `SUPABASE_SERVICE_ROLE_KEY` in Vite environment variables or any frontend file.

## Local Development

Start the Vite dev server:

```powershell
npm.cmd run dev
```

On macOS/Linux or a shell where npm scripts are enabled:

```bash
npm run dev
```

If Vite dependency caching gets stale after moving folders or changing dependencies:

```powershell
npm.cmd run dev -- --force
```

## Build and Checks

Create a production build:

```powershell
npm.cmd run build
```

Run tests:

```powershell
npm.cmd run test:run
```

Run build and tests together:

```powershell
npm.cmd run verify
```

Preview the production build locally:

```powershell
npm.cmd run preview
```

## Supabase Setup

Run the SQL migrations in `supabase/migrations` against the target Supabase project before using the app in production.

Required database features include:

- Supabase Auth
- Row Level Security policies from the migrations
- Household setup fields from `010_household_setup_and_data_controls.sql`
- Household profiles from `009_household_profiles.sql`
- Security hardening from `011_security_hardening.sql`

## Security Hardening Notes

The latest security migration tightens household write access. `owner` and `admin` can manage shared finance data. `member` and `viewer` retain household read access through the existing select policies, but no longer receive broad write access to cards, budgets, transactions, balances, recurring payments, or household profiles.

Card URLs are also validated before being rendered as external links. Invalid or unsupported URL protocols render as plain text instead of clickable links.

## Edge Functions

Account deletion uses this Supabase Edge Function:

```text
supabase/functions/delete-account
```

Household finance data deletion uses this Supabase Edge Function:

```text
supabase/functions/delete-household-finance-data
```

Deploy them with the Supabase CLI:

```powershell
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase functions deploy delete-account
npx supabase functions deploy delete-household-finance-data
```

The Edge Functions need these server-side environment variables/secrets:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ALLOWED_ORIGINS
```

`ALLOWED_ORIGINS` is optional but recommended. Use a comma-separated list, for example:

```text
https://ardalum.github.io,http://127.0.0.1:5173,http://localhost:5173
```

Keep `SUPABASE_SERVICE_ROLE_KEY` only in Supabase Edge Function secrets. Do not add it to `.env.local`, Vercel environment variables for the frontend, or source code.

## Backup and Import Safety

Supabase JSON backups and Excel exports contain household finance data such as card names, last four digits, balances, transactions, notes, budgets, recurring payments, and household profile labels. Store exported files privately.

Only import backup files you trust. The current importer validates the backup structure and merges records, but exported finance data is still sensitive.

## Deploy To Vercel

1. Push the repository to GitHub.
2. Create a new Vercel project and import the repository.
3. Use the default Vite settings:
   - Framework preset: `Vite`
   - Build command: `npm run build`
   - Output directory: `dist`
4. Add these Vercel environment variables:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

5. Deploy.

After deployment, update Supabase Auth URL settings:

- Add the Vercel production URL to allowed redirect URLs.
- Add local dev URLs such as `http://127.0.0.1:5173` if needed.
- Configure email confirmation and password reset templates/redirects for production.

## Production Checklist

- [ ] `npm.cmd run build` passes locally.
- [ ] `npm.cmd run test:run` passes locally.
- [ ] `npm.cmd run verify` passes locally.
- [ ] Supabase migrations have been applied to production.
- [ ] RLS is enabled on all household finance tables.
- [ ] `011_security_hardening.sql` has been applied and role permissions tested.
- [ ] `VITE_SUPABASE_URL` is set in the frontend host.
- [ ] `VITE_SUPABASE_ANON_KEY` is set in the frontend host.
- [ ] No service role key is present in frontend code or frontend env vars.
- [ ] `delete-account` Edge Function is deployed.
- [ ] `delete-household-finance-data` Edge Function is deployed.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured only as an Edge Function secret.
- [ ] `ALLOWED_ORIGINS` is configured for Edge Functions.
- [ ] Supabase Auth production site URL and redirect URLs are configured.
- [ ] Email confirmation and password reset settings are configured in Supabase.
- [ ] Test signup, first-time setup, export, import, household finance deletion, and account deletion in a non-production test account.
- [ ] Confirm `.env.local` is not committed.

## Legacy LocalStorage Tools

The app still includes clearly labeled legacy localStorage backup tools for users who need to recover older browser-only data. Current production data should live in Supabase.
