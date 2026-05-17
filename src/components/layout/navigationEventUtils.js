import { canUseActiveView } from "../../app/activeViewUtils.js";

export function shouldHandleNavigationView(view) {
  return canUseActiveView(view);
}
