import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  normalizeMonthlyBalancePatchForPersist,
  toLoadedMonthBalanceEntry,
} from "./monthlyBalancePersistence.js";

describe("monthly balances supabase service helpers", () => {
  it("keeps zero-balance unpaid rows as not checked inputs", () => {
    const entry = toLoadedMonthBalanceEntry(
      { balance: 0, paid: false, updated_at: "2026-05-17T00:00:00.000Z" },
      null,
    );

    assert.equal(entry.paid, false);
    assert.equal(entry.rawPaid, false);
    assert.equal(entry.checkedNoBalance, false);
  });

  it("keeps zero-balance paid rows as explicit checked-no-balance", () => {
    const entry = toLoadedMonthBalanceEntry(
      { balance: 0, paid: true, updated_at: "2026-05-17T00:00:00.000Z" },
      null,
    );

    assert.equal(entry.paid, true);
    assert.equal(entry.rawPaid, true);
    assert.equal(entry.checkedNoBalance, true);
  });

  it("keeps positive balances statement-paid when paid amount covers the balance", () => {
    const entry = toLoadedMonthBalanceEntry(
      { balance: 120, paid: false, updated_at: "2026-05-17T00:00:00.000Z" },
      { paid_amount: 120 },
    );

    assert.equal(entry.paid, true);
    assert.equal(entry.checkedNoBalance, false);
  });

  it("normalizes zero-balance unpaid patches to delete instead of implicit paid save", () => {
    const patch = normalizeMonthlyBalancePatchForPersist({ balance: 0, paid: false });

    assert.equal(patch.shouldDelete, true);
    assert.equal(patch.explicitNoBalance, false);
  });

  it("normalizes explicit no-balance patch to saved checked marker", () => {
    const patch = normalizeMonthlyBalancePatchForPersist({ balance: 0, paid: true });

    assert.equal(patch.shouldDelete, false);
    assert.equal(patch.explicitNoBalance, true);
    assert.equal(patch.balance, 0);
    assert.equal(patch.paid, true);
  });
});
