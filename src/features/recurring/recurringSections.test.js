import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { recurringSections } from "./recurringSections.js";

describe("recurring sections", () => {
  it("keeps recurring section ids stable", () => {
    assert.deepEqual(
      recurringSections.map((section) => section.id),
      ["this-month", "templates"],
    );
  });
});
