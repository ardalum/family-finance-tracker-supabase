import { rm } from "node:fs/promises";

const targets = ["dist", "coverage", "node_modules/.vite"];

for (const target of targets) {
  await rm(target, { force: true, recursive: true });
  console.log(`Removed ${target}`);
}
