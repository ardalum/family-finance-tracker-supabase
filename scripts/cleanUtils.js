import { rm } from "node:fs/promises";

export const DEFAULT_CLEAN_TARGETS = ["dist", "coverage", "node_modules/.vite"];

export async function cleanTargets({
  targets = DEFAULT_CLEAN_TARGETS,
  remove = rm,
  log = console.log,
} = {}) {
  for (const target of targets) {
    await remove(target, { force: true, recursive: true });
    log(`Removed ${target}`);
  }
}
