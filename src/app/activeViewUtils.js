import { ACTIVE_VIEW_KEY, DEFAULT_ACTIVE_VIEW } from "./activeViewConstants.js";
import { getPageContent, isKnownPageView } from "./pageContent.js";

export { ACTIVE_VIEW_KEY, DEFAULT_ACTIVE_VIEW };

export function normalizeActiveView(view, fallbackView = DEFAULT_ACTIVE_VIEW) {
  if (isKnownPageView(view)) return view;
  if (isKnownPageView(fallbackView)) return fallbackView;
  return DEFAULT_ACTIVE_VIEW;
}

export function canUseActiveView(view) {
  return isKnownPageView(view);
}

export function getActiveViewSnapshot(view, fallbackView = DEFAULT_ACTIVE_VIEW) {
  const activeView = normalizeActiveView(view, fallbackView);

  return {
    activeView,
    currentPage: getPageContent(activeView),
  };
}
