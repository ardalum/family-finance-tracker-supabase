import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("savings ui copy", () => {
  it("keeps clear savings goal and contribution workflow wording", () => {
    const source = read("src/features/savings/components/Savings.jsx");
    assert.equal(source.includes("Add goal"), true);
    assert.equal(source.includes("Add contribution"), true);
    assert.equal(source.includes("Monthly contributions trend"), true);
    assert.equal(source.includes("Recent contributions"), true);
    assert.equal(source.includes("Upcoming milestones"), true);
    assert.equal(
      source.includes(
        'Delete savings goal "${goalName}"? Existing contribution history will stay and appear as unlinked/deleted goal entries.',
      ),
      true,
    );
    assert.equal(source.includes("Delete this savings contribution?"), true);
    assert.equal(source.includes("See insights"), true);
  });
});
