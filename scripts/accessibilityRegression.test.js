import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("accessibility regressions", () => {
  it("keeps primary navigation semantics", () => {
    const source = read("src/components/layout/Navigation.jsx");
    assert.equal(source.includes('ariaLabel = "Primary navigation"'), true);
    assert.equal(source.includes("aria-label={ariaLabel}"), true);
    assert.equal(source.includes("aria-current"), true);
  });

  it("keeps section switchers exposing pressed state", () => {
    const creditCards = read("src/features/creditCards/components/CreditCardSectionPicker.jsx");
    const recurring = read("src/features/recurring/components/RecurringSectionPicker.jsx");
    assert.equal(creditCards.includes("aria-pressed={isActive}"), true);
    assert.equal(recurring.includes("aria-pressed={isActive}"), true);
  });

  it("keeps shared alert/loading components exposing live regions", () => {
    const alertSource = read("src/components/ui/InlineAlert.jsx");
    const loadingSource = read("src/components/ui/LoadingMessage.jsx");
    assert.equal(
      alertSource.includes('role={tone === "danger" || tone === "warning" ? "alert" : "status"}'),
      true,
    );
    assert.equal(loadingSource.includes('role="status"'), true);
    assert.equal(loadingSource.includes('aria-live="polite"'), true);
  });
});
