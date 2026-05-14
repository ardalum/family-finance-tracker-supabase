# Authentication and session QA checklist

Use this checklist before marking authentication and session handling as complete.

## Current status

Authentication and session handling is functionally wired for sign up, sign in, password recovery request, recovery submit, URL cleanup, and sign out.

Known follow-up: clear the recovery form field values after a successful recovery submit once the component edit can be applied safely.

## Build

- [ ] `npm run build` passes.
- [ ] `npm run dev` starts without auth-related console errors.

## Environment

- [ ] `VITE_SUPABASE_URL` is set.
- [ ] `VITE_SUPABASE_ANON_KEY` is set.
- [ ] Supabase authentication is enabled for email/password.
- [ ] Supabase redirect URLs include the deployed app URL.
- [ ] Supabase redirect URLs include the local development URL.

## Sign up

- [ ] New user can submit the sign-up form.
- [ ] Sign-up errors show friendly feedback.
- [ ] Confirmation email redirects back to the app.
- [ ] Confirmed user can sign in.

## Sign in

- [ ] Existing user can sign in.
- [ ] Invalid credentials show friendly feedback.
- [ ] Refreshing the app keeps the session.
- [ ] Signed-in users see the app instead of the auth form.

## Password recovery

- [ ] Recovery request sends an email.
- [ ] Recovery request errors show friendly feedback.
- [ ] Recovery email opens the app recovery screen.
- [ ] Recovery form rejects short passwords.
- [ ] Recovery form rejects mismatched passwords.
- [ ] Valid recovery submit updates the auth user.
- [ ] Successful recovery submit shows success feedback.
- [ ] Successful recovery submit removes auth URL state.
- [ ] Failed recovery submit shows friendly feedback.

## Sign out

- [ ] Normal sign out ends the current session.
- [ ] Global sign out ends all sessions.
- [ ] Signed-out users return to the auth form.
- [ ] Signed-out status message displays correctly.

## Edge cases

- [ ] App handles missing Supabase environment variables gracefully.
- [ ] App handles expired recovery links gracefully.
- [ ] App handles invalid recovery links gracefully.
- [ ] App handles refresh during recovery callback without crashing.
- [ ] App handles direct navigation to auth status URLs.
