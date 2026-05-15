import { readAppData } from "../lib/storage/appStorage.js";

export function resolveLocalAppData(nextData, readData = readAppData) {
  return nextData ?? readData();
}
