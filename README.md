# Credit Card Tracker Supabase

A Vite + React personal finance tracker backed by Supabase. The app supports Supabase Auth, household setup, household profiles, credit card tracking, monthly card balances, budgets, spending, recurring payments, dashboard views, Supabase JSON backup/import, Excel export, and account deletion through a Supabase Edge Function.

## Install

Install dependencies:

```powershell
npm.cmd install
```

On macOS/Linux or a shell where npm scripts are enabled:

```bash
npm install
```

## Environment Variables

Create a local `.env.local` file for development:

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

If Vite dependency caching gets stale after moving folders or changing dependencies:

```powershell
npm.cmd run dev -- --force
```

## Build

Create a production build:

```powershell
npm.cmd run build
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

## Account Deletion Edge Function

True account deletion uses the Supabase Edge Function at:

```text
supabase/functions/delete-account
```

Deploy it with the Supabase CLI:

```powershell
npx supabase login
npx supabase link --project-ref your-project-ref
npx supabase functions deploy delete-account
```

The Edge Function needs these server-side environment variables/secrets:

```text
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

Keep `SUPABASE_SERVICE_ROLE_KEY` only in Supabase Edge Function secrets. Do not add it to `.env.local`, Vercel environment variables for the frontend, or source code.

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
- [ ] Supabase migrations have been applied to production.
- [ ] RLS is enabled on all household finance tables.
- [ ] `VITE_SUPABASE_URL` is set in Vercel.
- [ ] `VITE_SUPABASE_ANON_KEY` is set in Vercel.
- [ ] No service role key is present in frontend code or Vercel frontend env vars.
- [ ] `delete-account` Edge Function is deployed.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is configured only as an Edge Function secret.
- [ ] Supabase Auth production site URL and redirect URLs are configured.
- [ ] Email confirmation and password reset settings are configured in Supabase.
- [ ] Test signup, first-time setup, export, import, and account deletion in a non-production test account.
- [ ] Confirm `.env.local` is not committed.

## Legacy LocalStorage Tools

The app still includes clearly labeled legacy localStorage backup tools for users who need to recover older browser-only data. Current production data should live in Supabase.
