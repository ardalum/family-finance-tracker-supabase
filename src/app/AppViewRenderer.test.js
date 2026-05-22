import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const appViewRendererSource = fs.readFileSync(path.resolve("src/app/AppViewRenderer.jsx"), "utf-8");

describe("AppViewRenderer money center aliases", () => {
  it("routes financial-position to MoneyCenter", () => {
    assert.equal(appViewRendererSource.includes('activeView === "financial-position"'), true);
    assert.equal(appViewRendererSource.includes("<MoneyCenter"), true);
  });

  it("routes income and accounts aliases to MoneyCenter", () => {
    assert.equal(appViewRendererSource.includes('activeView === "income"'), true);
    assert.equal(appViewRendererSource.includes('activeView === "accounts"'), true);
  });
});
