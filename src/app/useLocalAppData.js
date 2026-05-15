import { useState } from "react";
import { readAppData } from "../lib/storage/appStorage.js";
import { resolveLocalAppData } from "./localAppDataUtils.js";

export function useLocalAppData() {
  const [appData, setAppData] = useState(() => readAppData());

  function refreshData(nextData) {
    setAppData(resolveLocalAppData(nextData));
  }

  return {
    appData,
    refreshData,
    setAppData,
  };
}
