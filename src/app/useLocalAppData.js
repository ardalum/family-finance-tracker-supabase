import { useState } from "react";
import { readAppData } from "../lib/storage/appStorage.js";

export function useLocalAppData() {
  const [appData, setAppData] = useState(() => readAppData());

  function refreshData(nextData) {
    setAppData(nextData ?? readAppData());
  }

  return {
    appData,
    refreshData,
    setAppData,
  };
}
