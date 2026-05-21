import { ChevronDown, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import FeatureIcon from "../ui/FeatureIcon.jsx";
import { NAVIGATE_EVENT } from "../../lib/navigationTargets.js";
import { createInitialExpandedGroupState, groupedNavigationSections } from "./navigationItems.js";
import { shouldHandleNavigationView } from "./navigationEventUtils.js";

export default function NavigationV2({
  activeView,
  onChange,
  onItemSelected,
  collapsed = false,
  ariaLabel = "Primary navigation",
}) {
  const [expandedGroups, setExpandedGroups] = useState(() =>
    createInitialExpandedGroupState(activeView),
  );
  const activeSectionId = useMemo(
    () =>
      groupedNavigationSections.find((section) => section.views.includes(activeView))?.id ?? null,
    [activeView],
  );

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
    <nav className="grid gap-4 pr-1" aria-label={ariaLabel}>
      {groupedNavigationSections.map((section) => (
        <div key={section.id} className="grid gap-1.5">
          {!collapsed ? (
            <button
              type="button"
              className="inline-flex min-h-8 w-full items-center justify-between rounded-lg px-2 text-left text-[0.66rem] font-semibold tracking-[0.11em] text-text-muted transition hover:bg-white/70"
              onClick={() =>
                setExpandedGroups((previous) => ({
                  ...previous,
                  [section.id]: !previous[section.id],
                }))
              }
              aria-expanded={expandedGroups[section.id] ? "true" : "false"}
              aria-controls={`nav-v2-group-${section.id}`}
            >
              <span>{section.label}</span>
              {expandedGroups[section.id] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : null}

          <div
            id={`nav-v2-group-${section.id}`}
            className={`grid gap-1 ${collapsed || expandedGroups[section.id] ? "" : "hidden"}`}
          >
            {section.items.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`group inline-flex min-h-11 w-full items-center rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-primary text-white shadow-[0_10px_20px_-14px_rgba(10,31,54,1)]"
                      : "text-text-soft hover:bg-white/80 hover:text-text-main"
                  } ${collapsed ? "justify-center" : "justify-start gap-2.5"}`}
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
                    variant={isActive ? "neutral" : item.iconVariant}
                    mode="plain"
                    size={16}
                    active={isActive}
                    iconClassName={isActive ? "text-white" : "group-hover:text-text-main"}
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
