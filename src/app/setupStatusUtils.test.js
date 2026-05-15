import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getInitialSetupStatusState,
  getSetupStatusErrorMessage,
  getSkippedSetupStatusState,
  SETUP_CHECK_ERROR_COPY,
  shouldSkipSetupStatusCheck,
} from "./setupStatusUtils.js";

describe("setup status helpers", () => {
  it("skips setup status checks when there is no active household", () => {
    assert.equal(
      shouldSkipSetupStatusCheck({ activeHouseholdId: "", activeHousehold: null }),
      true,
    );
  });

  it("skips setup status checks when setup is already complete", () => {
    assert.equal(
      shouldSkipSetupStatusCheck({
        activeHouseholdId: "household-1",
        activeHousehold: { setupComplete: true },
      }),
      true,
    );
  });

  it("does not skip setup status checks for incomplete households", () => {
    assert.equal(
      shouldSkipSetupStatusCheck({
        activeHouseholdId: "household-1",
        activeHousehold: { setupComplete: false },
      }),
      false,
    );
  });

  it("returns error messages from errors", () => {
    assert.equal(getSetupStatusErrorMessage(new Error("Boom")), "Boom");
  });

  it("returns fallback error message when an error has no message", () => {
    assert.equal(getSetupStatusErrorMessage({}), SETUP_CHECK_ERROR_COPY.loadFailed);
  });

  it("returns initial setup status state", () => {
    assert.deepEqual(getInitialSetupStatusState(), {
      isLoading: true,
      error: "",
    });
  });

  it("returns skipped setup status state", () => {
    assert.deepEqual(getSkippedSetupStatusState(), {
      isLoading: false,
      error: "",
    });
  });
});
