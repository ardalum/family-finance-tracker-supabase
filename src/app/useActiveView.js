import { useState } from "react";
import { canUseActiveView, getActiveViewSnapshot } from "./activeViewUtils.js";
import {
  DEFAULT_ACTIVE_VIEW,
  getStoredActiveView,
  setStoredActiveView,
} from "./activeViewStorage.js";

export function useActiveView() {
  const [activeView, setActiveViewState] = useState(() => getStoredActiveView());
  const activeViewSnapshot = getActiveViewSnapshot(activeView);

  function setActiveView(nextView) {
    if (!canUseActiveView(nextView)) return;

    setActiveViewState(nextView);
    setStoredActiveView(nextView);
  }

  return {
    activeView: activeViewSnapshot.activeView,
    currentPage: activeViewSnapshot.currentPage,
    defaultActiveView: DEFAULT_ACTIVE_VIEW,
    setActiveView,
  };
}
