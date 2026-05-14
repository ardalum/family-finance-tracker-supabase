import { useState } from "react";
import { getPageContent, isKnownPageView } from "./pageContent.js";
import { DEFAULT_ACTIVE_VIEW, getStoredActiveView, setStoredActiveView } from "./activeViewStorage.js";

export function useActiveView() {
  const [activeView, setActiveViewState] = useState(() => getStoredActiveView());

  function setActiveView(nextView) {
    if (!isKnownPageView(nextView)) return;

    setActiveViewState(nextView);
    setStoredActiveView(nextView);
  }

  return {
    activeView,
    currentPage: getPageContent(activeView),
    defaultActiveView: DEFAULT_ACTIVE_VIEW,
    setActiveView,
  };
}
