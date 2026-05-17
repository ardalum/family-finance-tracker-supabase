import { useEffect, useState } from "react";
import { canUseActiveView, getActiveViewSnapshot } from "./activeViewUtils.js";
import {
  DEFAULT_ACTIVE_VIEW,
  getHashActiveView,
  getStoredActiveView,
  setHashActiveView,
  setStoredActiveView,
} from "./activeViewStorage.js";

export function useActiveView() {
  const [activeView, setActiveViewState] = useState(() => {
    const storedView = getStoredActiveView();
    return getHashActiveView(undefined, storedView);
  });
  const activeViewSnapshot = getActiveViewSnapshot(activeView);

  useEffect(() => {
    setHashActiveView(activeView, { mode: "replace" });
  }, [activeView]);

  useEffect(() => {
    function handleHashChange() {
      const storedView = getStoredActiveView();
      const nextView = getHashActiveView(undefined, storedView);
      setActiveViewState(nextView);
      setStoredActiveView(nextView);
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  function setActiveView(nextView) {
    if (!canUseActiveView(nextView)) return;

    setHashActiveView(nextView, { mode: "push" });
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
