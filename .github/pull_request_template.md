## Summary

## Changes

-

## Testing checklist

For code, config, dependency, workflow, or behavior changes:

- [ ] `npm run verify` passes.
- [ ] `npm run verify:clean` passes when generated folders or Vite cache may be stale.
- [ ] `npm run dev` starts successfully when browser behavior should be checked.
- [ ] Relevant browser checks were completed.

For documentation-only changes:

- [ ] No local app testing needed.
- [ ] GitHub Actions checks are enough.

## Local test commands

```bash
git fetch origin
git checkout <branch-name>
git pull origin <branch-name>
npm ci
npm run verify
npm run dev
```
