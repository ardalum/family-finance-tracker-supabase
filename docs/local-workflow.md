# Local workflow

## Node

Use Node 24 for this project.

The version is listed in:

- `.nvmrc`
- `package.json`
- GitHub Actions through `.nvmrc`

Npm engine checks are enabled through `.npmrc`.

With nvm:

```bash
nvm use
```

## Install

For a clean install:

```bash
npm ci
```

For normal local setup:

```bash
npm install
```

## Environment setup

Copy the example environment file:

```bash
cp .env.example .env.local
```

On PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Fill in:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not commit `.env.local`.

## Check commands

For code, config, dependency, workflow, or behavior changes, run this before merging:

```bash
npm run verify
```

`npm run verify` runs formatting checks, production build, tests, and lint.

Run the app locally when browser behavior should be checked:

```bash
npm run dev
```

Remove generated local folders before a clean rebuild:

```bash
npm run clean
```

The clean command removes `dist`, `coverage`, and the Vite dependency cache.

For documentation-only changes, local app testing is not usually needed. GitHub Actions checks are enough unless the documentation change includes commands that should be manually verified.

## Pull request routine

Use the pull request template and include:

- summary
- changes
- testing checklist
- local commands when local testing is needed

Prefer focused pull requests, not one-line pull requests for every tiny repo setting.

Good pull request scope examples:

- one feature hook extraction
- one app shell wiring pass
- one grouped tooling update
- one grouped documentation update
- one focused UI cleanup

Avoid mixing unrelated changes, such as UI redesign, data service changes, migrations, and docs in one pull request.

## Project checks

The project workflow runs on pull requests and main branch updates.

It installs dependencies and runs `npm run verify`.

The deploy workflow also runs `npm run verify` before publishing the GitHub Pages build.

Older in-progress checks for the same branch are cancelled when newer commits are pushed.

## Architecture cleanup

Keep frontend architecture changes focused.

Preferred order:

1. Add tests for existing logic.
2. Add helper modules or hooks.
3. Wire helpers into `App.jsx` in focused pull requests.
4. Extract feature hooks one feature at a time.
5. Avoid unrelated UI or data changes in the same architecture pull request.
