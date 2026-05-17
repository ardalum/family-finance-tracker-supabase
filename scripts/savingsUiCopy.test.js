import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("savings ui copy", () => {
  it("keeps separation, inactive-goal, and delete confirmation wording", () => {
    const source = read("src/features/savings/components/Savings.jsx");
    assert.equal(source.includes("Savings contributions are tracked separately"), true);
    assert.equal(source.includes("do not change spending or budget"), true);
    assert.equal(
      source.includes(
        "Inactive goals stay in history but are hidden from new contribution goal options.",
      ),
      true,
    );
    assert.equal(source.includes("Delete this savings contribution?"), true);
    assert.equal(source.includes("Delete savings goal"), true);
    assert.equal(source.includes("Set a target amount to track progress percentage."), true);
  });
});
