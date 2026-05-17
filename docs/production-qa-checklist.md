# Production QA checklist

Use this checklist before each production release.

## Preconditions

- [ ] Use a test household and test account where destructive actions can be safely validated.
- [ ] Keep recent backups private and accessible before QA starts.
- [ ] Confirm environment variables are set for the deployment target.

## Dashboard

- [ ] Total credit limit matches all active cards only.
- [ ] Statement balance total matches entered monthly balances.
- [ ] Unpaid balance total matches unpaid statement amounts.
- [ ] Due soon and past due credit-card alerts appear correctly.
- [ ] Budget overage and near-limit alerts appear correctly.
- [ ] Recurring unpaid and past-due alerts appear correctly.

## Cards

- [ ] Add credit card works.
- [ ] Edit credit card works.
- [ ] Deactivate card works.
- [ ] Delete card works and confirmation dialog appears.
- [ ] Monthly balances desktop table works.
- [ ] Monthly balances mobile cards work.
- [ ] Paid checkbox updates correctly.
- [ ] Mark checked, no balance works.
- [ ] Statement details save correctly.
- [ ] Autopay fields save correctly.
- [ ] Minimum payment and paid amount fields save correctly.

## Budget

- [ ] Add budget category works.
- [ ] Edit budget category works.
- [ ] Delete budget category works.
- [ ] Copy previous month works.
- [ ] Default budget flows still work.

## Spending

- [ ] Add transaction works.
- [ ] Edit transaction works.
- [ ] Delete transaction works with confirmation dialog.
- [ ] Split transaction save works for valid split totals.
- [ ] Invalid split totals are rejected.
- [ ] Refund transaction behavior is correct.
- [ ] Payment transaction behavior is correct.
- [ ] Filters work (search/card/category/type/payment/source/quick filters).
- [ ] Sorting works.
- [ ] Mobile layout remains usable.

## Recurring Bills

- [ ] Add recurring bill works.
- [ ] Mark paid works.
- [ ] Mark unpaid works.
- [ ] Skip works.
- [ ] Variable bill actual amount flow works.
- [ ] Recurring-generated transactions appear correctly.

## Income

- [ ] Income page opens from Dashboard quick action and Account menu Tools.
- [ ] Add income source works.
- [ ] Edit income source works.
- [ ] Delete income source works with confirmation wording.
- [ ] Add income entry works.
- [ ] Edit income entry works.
- [ ] Delete income entry works with confirmation wording.
- [ ] Month switching filters income entries correctly.
- [ ] Monthly income total updates correctly for selected month.
- [ ] Income entries do not change Spending totals.
- [ ] Income entries do not change Budget totals.
- [ ] Inactive income sources are not shown in active source selector options.

## Backup / Restore

- [ ] Export backup works.
- [ ] Import backup works with trusted files only.
- [ ] No obvious duplicate records after import.
- [ ] Team confirms backups contain sensitive finance data and are stored privately.
- [ ] Supabase JSON export includes `incomeSources` and `incomeEntries`.
- [ ] Excel export includes `Income Sources` and `Income Entries` sheets.

## Household / Settings

- [ ] Household profiles management works.
- [ ] Role behavior (if available in environment) is correct.
- [ ] Account deletion flow works (test account only).
- [ ] Household finance data deletion works with exact confirmation phrase.

## Deployment

- [ ] `npm run verify` passes locally.
- [ ] GitHub Actions deploy workflow passes.
- [ ] Supabase Edge Functions are deployed (`delete-account`, `delete-household-finance-data`).
- [ ] Supabase Auth redirect URLs are configured for production and local callback needs.
- [ ] Production smoke test completed on deployed app.

## Post-deploy smoke test

- [ ] Dashboard opens and key summaries render.
- [ ] Cards opens and month selector works.
- [ ] Budget opens and totals render.
- [ ] Spending opens and transaction list renders.
- [ ] Bills opens and recurring sections render.
- [ ] Insights opens and charts render.
