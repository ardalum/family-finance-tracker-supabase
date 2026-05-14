import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createAsyncState,
  getErrorAsyncState,
  getIdleAsyncState,
  getInitialAsyncState,
  getLoadingAsyncState,
  getSavingAsyncState,
} from "./asyncStateUtils.js";

describe("async state helpers", () => {
  it("creates default async state", () => {
    assert.deepEqual(createAsyncState(), {
      isLoading: true,
      isSaving: false,
      error: "",
    });
  });

  it("creates custom async state", () => {
    assert.deepEqual(createAsyncState({ isLoading: false, isSaving: true, error: "Boom" }), {
      isLoading: false,
      isSaving: true,
      error: "Boom",
    });
  });

  it("creates initial state", () => {
    assert.deepEqual(getInitialAsyncState(), {
      isLoading: true,
      isSaving: false,
      error: "",
    });
  });

  it("creates idle state", () => {
    assert.deepEqual(getIdleAsyncState(), {
      isLoading: false,
      isSaving: false,
      error: "",
    });
  });

  it("creates loading state", () => {
    assert.deepEqual(getLoadingAsyncState(), {
      isLoading: true,
      isSaving: false,
      error: "",
    });
  });

  it("creates saving state", () => {
    assert.deepEqual(getSavingAsyncState(), {
      isLoading: false,
      isSaving: true,
      error: "",
    });
  });

  it("creates error state from an error message", () => {
    assert.deepEqual(getErrorAsyncState(new Error("Failed")), {
      isLoading: false,
      isSaving: false,
      error: "Failed",
    });
  });

  it("creates error state from fallback copy", () => {
    assert.deepEqual(getErrorAsyncState({}, "Fallback failed"), {
      isLoading: false,
      isSaving: false,
      error: "Fallback failed",
    });
  });
});
