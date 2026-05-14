# Local workflow

## Node

Use Node 24 for this project.

The version is listed in `.nvmrc` and `package.json`.

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

## Check commands

Run these before merging code changes:

```bash
npm run build
npm run test:run
npm run verify
npm run dev
```

`npm run verify` runs the build and test commands together.

## Pull request routine

Use the pull request template and include:

- summary
- changes
- testing checklist
- local commands

## Project checks

The project workflow runs on pull requests and main branch updates.

It installs dependencies, builds the app, and runs tests.

## Architecture cleanup

Keep frontend architecture changes small.

Preferred order:

1. Add tests.
2. Add helper modules.
3. Wire helpers into `App.jsx` in small pull requests.
4. Extract feature hooks one at a time.
