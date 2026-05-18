import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FeatureIcon from "../ui/FeatureIcon.jsx";
import { NAVIGATE_EVENT } from "../../lib/navigationTargets.js";
import {
  createInitialExpandedGroupState,
  getSectionIdByView,
  groupedNavigationSections,
  navItems,
} from "./navigationItems.js";
import { shouldHandleNavigationView } from "./navigationEventUtils.js";

export default function Navigation({
  activeView,
  onChange,
  collapsed = false,
  onItemSelected,
  ariaLabel = "Primary navigation",
}) {
  const [expandedGroups, setExpandedGroups] = useState(() =>
    createInitialExpandedGroupState(activeView),
  );

  const activeSectionId = useMemo(() => getSectionIdByView(activeView), [activeView]);

  useEffect(() => {
    if (!activeSectionId) return;
    setExpandedGroups((previous) =>
      previous[activeSectionId] ? previous : { ...previous, [activeSectionId]: true },
    );
  }, [activeSectionId]);

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
    <nav className="grid gap-3" aria-label={ariaLabel}>
      {groupedNavigationSections.map((section) => (
        <div key={section.id} className="grid gap-1.5 rounded-lg border border-app-border/70 p-1.5">
          {!collapsed ? (
            <button
              type="button"
              className="inline-flex min-h-8 w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-text-muted transition hover:bg-app-background"
              onClick={() =>
                setExpandedGroups((previous) => ({
                  ...previous,
                  [section.id]: !previous[section.id],
                }))
              }
              aria-expanded={expandedGroups[section.id] ? "true" : "false"}
              aria-controls={`navigation-group-${section.id}`}
            >
              <span>{section.label}</span>
              {expandedGroups[section.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <p className="px-1.5 text-[0.62rem] font-semibold uppercase tracking-[0.08em] text-text-subtle">
              {section.label.slice(0, 1)}
            </p>
          )}
          <div
            id={`navigation-group-${section.id}`}
            className={`grid gap-1 ${collapsed || expandedGroups[section.id] ? "" : "hidden"}`}
          >
            {section.items.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`group inline-flex min-h-9 w-full items-center rounded-lg px-2 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-gray-900 text-white shadow-sm"
                      : "text-text-main hover:bg-app-background"
                  } ${collapsed ? "justify-center" : "justify-start gap-2"}`}
                  onClick={() => {
                    onChange(item.id);
                    onItemSelected?.();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={`Go to ${item.label}`}
                  title={item.label}
                >
                  <FeatureIcon
                    icon={item.icon}
                    variant={item.iconVariant}
                    mode="plain"
                    size={16}
                    active={isActive}
                    iconClassName={!isActive ? "group-hover:text-text-main" : ""}
                  />
                  {!collapsed ? <span className="truncate">{item.label}</span> : null}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export { navItems, groupedNavigationSections };
