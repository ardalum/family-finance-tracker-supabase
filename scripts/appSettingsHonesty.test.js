import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("app settings honesty", () => {
  it("keeps only working active controls and marks unfinished preferences as planned", () => {
    const source = read("src/features/settings/components/AppSettings.jsx");

    assert.equal(source.includes('label="Show cents"'), true);
    assert.equal(source.includes('label="Date format"'), false);
    assert.equal(source.includes('label="Table density"'), false);
    assert.equal(source.includes('label="Default selected month"'), false);
    assert.equal(source.includes("Dark mode"), true);
    assert.equal(source.includes("not active yet"), true);
  });
});
