import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const infoTooltipSource = readFileSync("src/components/ui/InfoTooltip.jsx", "utf8");
const moneyCenterSource = readFileSync(
  "src/features/moneyCenter/components/MoneyCenter.jsx",
  "utf8",
);

test("info tooltip uses viewport-safe fixed positioning instead of right-anchored absolute placement", () => {
  assert.ok(infoTooltipSource.includes("getBoundingClientRect"));
  assert.ok(infoTooltipSource.includes("window.innerWidth"));
  assert.ok(infoTooltipSource.includes("window.innerHeight"));
  assert.ok(infoTooltipSource.includes("Math.min("));
  assert.ok(infoTooltipSource.includes("Math.max("));
  assert.ok(infoTooltipSource.includes('window.addEventListener("resize"'));
  assert.ok(infoTooltipSource.includes('window.addEventListener("scroll"'));
  assert.equal(infoTooltipSource.includes("absolute right-0 top-6"), false);
  assert.ok(infoTooltipSource.includes("fixed z-[70]"));
});

test("info tooltip keeps close behavior for escape and outside click", () => {
  assert.ok(infoTooltipSource.includes('event.key === "Escape"'));
  assert.ok(infoTooltipSource.includes('document.addEventListener("mousedown"'));
  assert.ok(infoTooltipSource.includes('document.addEventListener("touchstart"'));
});

test("money center still renders shared info tooltip labels", () => {
  assert.ok(moneyCenterSource.includes("Cash position calculation info"));
  assert.ok(moneyCenterSource.includes("Income and cash trend calculation info"));
  assert.ok(moneyCenterSource.includes("Financial position calculation info"));
});
