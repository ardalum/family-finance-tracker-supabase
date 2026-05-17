import { useEffect, useState } from "react";
import { NAVIGATE_EVENT } from "../../lib/navigationTargets.js";
import { navItems } from "./navigationItems.js";
import { shouldHandleNavigationView } from "./navigationEventUtils.js";

export default function Navigation({ activeView, onChange }) {
  const [hoveredId, setHoveredId] = useState("");

  useEffect(() => {
    function handleNavigate(event) {
      const view = event.detail?.view;
      if (!shouldHandleNavigationView(view)) return;
      onChange(view);
    }

    window.addEventListener(NAVIGATE_EVENT, handleNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
  }, [onChange]);

  return (
    <nav className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        const isHovered = hoveredId === item.id;
        const tabStyle = getTabStyle({ isActive, isHovered });
        const iconStyle = {
          color: isActive ? "#FFFFFF" : isHovered ? "#111827" : "#374151",
        };

        return (
          <button
            key={item.id}
            type="button"
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold shadow-none transition disabled:cursor-not-allowed sm:w-auto sm:justify-start sm:px-3.5"
            style={tabStyle}
            onClick={() => onChange(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId("")}
            onFocus={() => setHoveredId(item.id)}
            onBlur={() => setHoveredId("")}
            aria-current={isActive ? "page" : undefined}
            aria-label={`Go to ${item.label}`}
            title={item.label}
          >
            <Icon size={16} style={iconStyle} aria-hidden="true" />
            <span className="sm:hidden">{item.shortLabel}</span>
            <span className="hidden sm:inline">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export { navItems };

function getTabStyle({ isActive, isHovered }) {
  if (isActive) {
    return {
      backgroundColor: "#1F2937",
      borderColor: "#1F2937",
      color: "#FFFFFF",
      boxShadow: "0 1px 2px rgb(17 24 39 / 0.12)",
    };
  }

  if (isHovered) {
    return {
      backgroundColor: "#F3F4F6",
      borderColor: "#D1D5DB",
      color: "#111827",
    };
  }

  return {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    color: "#111827",
  };
}
