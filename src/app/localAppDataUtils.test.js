import assert from "node:assert/strict";
import test from "node:test";

import { resolveLocalAppData } from "./localAppDataUtils.js";

test("resolveLocalAppData returns provided data", () => {
  const providedData = { creditCards: [{ id: "card-1" }] };

  assert.equal(
    resolveLocalAppData(providedData, () => ({ creditCards: [] })),
    providedData,
  );
});

test("resolveLocalAppData reads data when no next data is provided", () => {
  const storedData = { creditCards: [{ id: "stored-card" }] };

  assert.equal(
    resolveLocalAppData(undefined, () => storedData),
    storedData,
  );
});

test("resolveLocalAppData treats null as missing data", () => {
  const storedData = { creditCards: [{ id: "stored-card" }] };

  assert.equal(
    resolveLocalAppData(null, () => storedData),
    storedData,
  );
});

test("resolveLocalAppData preserves intentionally empty objects", () => {
  const providedData = {};

  assert.equal(
    resolveLocalAppData(providedData, () => ({ creditCards: [] })),
    providedData,
  );
});
