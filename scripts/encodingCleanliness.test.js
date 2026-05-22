import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";

const ROOTS = ["src", "scripts", "docs", "README.md"];
const BAD_PATTERNS = ["\uFFFD", "\u00EF\u00BF\u00BD"];
const SKIP_DIRS = new Set(["node_modules", "dist", ".git"]);

function walk(path) {
  const stat = statSync(path);
  if (!stat.isDirectory()) return [path];

  const entries = readdirSync(path).filter((name) => !SKIP_DIRS.has(name));
  return entries.flatMap((name) => walk(join(path, name)));
}

describe("encoding cleanliness", () => {
  it("does not include obvious mojibake patterns in src/docs/scripts/readme", () => {
    const files = ROOTS.flatMap((root) => walk(root)).filter((path) =>
      /\.(md|js|jsx|json|css|html|mjs)$/i.test(path),
    );
    const offenders = [];

    for (const path of files) {
      const text = readFileSync(path, "utf8");
      for (const pattern of BAD_PATTERNS) {
        if (text.includes(pattern)) {
          offenders.push(`${path}: contains "${pattern}"`);
        }
      }
    }

    assert.deepEqual(offenders, []);
  });
});
