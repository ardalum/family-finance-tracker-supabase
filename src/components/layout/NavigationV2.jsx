import { useEffect } from "react";
import { NAVIGATE_EVENT } from "../../lib/navigationTargets.js";
import { dashboardV2SidebarItems } from "./navigationItems.js";
import { shouldHandleNavigationView } from "./navigationEventUtils.js";

export default function NavigationV2({
  activeView,
  onChange,
  onItemSelected,
  collapsed = false,
  ariaLabel = "Primary navigation",
}) {
  useEffect(() => {
    function handleNavigate(event) {
      const view = event.detail?.view;
      if (!shouldHandleNavigationView(view)) return;
      onChange(view);
      onItemSelected?.();
    }

    window.addEventListener(NAVIGATE_EVENT, handleNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
  }, [onChange, onItemSelected]);

  return (
    <nav className="grid gap-1.5 pr-1" aria-label={ariaLabel}>
      {dashboardV2SidebarItems.map((item) => {
        const Icon = item.icon;
        const isActive = item.id ? activeView === item.id : false;
        const isDisabled = item.disabled || !item.id;

        return (
          <button
            key={`${item.label}-${item.id ?? "disabled"}`}
            type="button"
            className={`group inline-flex min-h-11 w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-brand-primary text-white shadow-[0_10px_20px_-14px_rgba(10,31,54,1)]"
                : isDisabled
                  ? "cursor-not-allowed text-text-muted/70 opacity-70"
                  : "text-text-soft hover:bg-white/80 hover:text-text-main"
            } ${collapsed ? "justify-center" : "justify-start gap-2.5"}`}
            onClick={() => {
              if (isDisabled) return;
              onChange(item.id);
              onItemSelected?.();
            }}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Go to ${item.label}`}
            title={isDisabled ? `${item.label} (coming soon)` : item.label}
            disabled={isDisabled}
          >
            <Icon
              size={18}
              className={
                isActive ? "text-white" : isDisabled ? "text-text-muted/70" : "text-text-soft"
              }
              aria-hidden="true"
            />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </button>
        );
      })}
    </nav>
  );
}
