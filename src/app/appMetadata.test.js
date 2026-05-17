import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { appMetadata } from "./appMetadata.js";

const packageJson = JSON.parse(
  readFileSync(new URL("../../package.json", import.meta.url), "utf8"),
);

describe("app metadata", () => {
  it("keeps the displayed app version aligned with package.json", () => {
    assert.equal(appMetadata.version, packageJson.version);
  });

  it("keeps required app metadata fields populated", () => {
    assert.equal(appMetadata.name, "WalletFlow");

    for (const field of [
      "creatorName",
      "version",
      "releaseLabel",
      "releaseDate",
      "supportEmail",
    ]) {
      assert.equal(typeof appMetadata[field], "string");
      assert.notEqual(appMetadata[field].trim(), "");
    }
  });

  it("keeps support email metadata usable", () => {
    assert.equal(appMetadata.supportEmail.includes("@"), true);
    assert.equal(appMetadata.supportEmail.includes("."), true);
  });
});
