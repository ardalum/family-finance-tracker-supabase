## Summary


## Changes

- 

## Testing checklist

For code, config, dependency, workflow, or behavior changes:

- [ ] `npm run build` passes.
- [ ] `npm run test:run` passes.
- [ ] `npm run verify` passes.
- [ ] `npm run dev` starts successfully.

For documentation-only changes:

- [ ] No local app testing needed.
- [ ] GitHub Actions checks are enough.

## Local test commands

```bash
git fetch origin
git checkout <branch-name>
git pull origin <branch-name>
npm run build
npm run test:run
npm run verify
npm run dev
```
