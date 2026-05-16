import {
  ClipboardList,
  Clock3,
  DatabaseBackup,
  Home,
  Info,
  LifeBuoy,
  LogOut,
  Settings,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import { getAccountIdentity } from "../authAccountDisplayUtils.js";
import { getFriendlyAuthError } from "../authErrors.js";
import { useAuth } from "../AuthProvider.jsx";
import { signOut, signOutEverywhere } from "../authService.js";
import { getSessionSummary } from "../authSessionUtils.js";
import { AUTH_VIEW_TARGETS } from "../authViewTargets.js";

const menuSections = [
  {
    title: "Account",
    items: [
      {
        icon: UserCircle,
        label: "Account Settings",
        description: "Profile identity, session details, and planned security controls.",
        view: AUTH_VIEW_TARGETS.accountSettings,
      },
      {
        icon: ShieldCheck,
        label: "Data & Privacy",
        description: "Privacy policy, data handling, exports, and deletion notes.",
        view: "privacy-policy",
      },
    ],
  },
  {
    title: "Household",
    items: [
      {
        icon: Home,
        label: "Household Settings",
        description: "Members, household access, and active household.",
        view: "household-settings",
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        icon: DatabaseBackup,
        label: "Backup & Restore",
        description: "Export data or restore legacy local backups.",
        view: "backup",
      },
      {
        icon: Settings,
        label: "App Settings",
        description: "Display preferences and app behavior.",
        view: "app-settings",
      },
    ],
  },
  {
    title: "Info",
    items: [
      {
        icon: LifeBuoy,
        label: "Help / Support",
        description: "Troubleshooting notes, safe testing reminders, and contact info.",
        view: "help-support",
      },
      {
        icon: ClipboardList,
        label: "Release Notes",
        description: "Recent app changes, cleanup passes, and improvements.",
        view: "release-notes",
      },
      {
        icon: Info,
        label: "About WalletFlow",
        description: "App purpose, version notes, and credits.",
        view: "about",
      },
    ],
  },
];

export default function AccountMenu({ onNavigate }) {
  const { session, user, setError } = useAuth();
  const { activeHousehold, activeMembership } = useHouseholds();
  const [signingOutMode, setSigningOutMode] = useState("");
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const identity = useMemo(
    () => getAccountIdentity(user, activeMembership, activeHousehold),
    [activeHousehold, activeMembership, user],
  );
  const sessionStatus = useMemo(() => getSessionSummary(session), [session]);
  const isSigningOut = Boolean(signingOutMode);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  async function handleSignOut() {
    setSigningOutMode("current");
    setError("");

    try {
      await signOut();
    } catch (error) {
      setError(getFriendlyAuthError(error, "Could not sign out."));
      setSigningOutMode("");
    }
  }

  async function handleSignOutEverywhere() {
    setSigningOutMode("everywhere");
    setError("");

    try {
      await signOutEverywhere();
    } catch (error) {
      setError(getFriendlyAuthError(error, "Could not sign out from all devices."));
      setSigningOutMode("");
    }
  }

  function navigate(view) {
    onNavigate?.(view);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative min-w-0">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-soft transition hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
        onClick={() => setOpen((current) => !current)}
        aria-label={identity.email ? `Account menu for ${identity.email}` : "Account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        title={identity.email || "Account menu"}
      >
        <UserCircle size={18} className="shrink-0" aria-hidden="true" />
      </button>

      {open ? (
        <div
          className="absolute right-0 z-30 mt-2 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-lg"
          role="menu"
        >
          <div className="border-b border-app-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-text-muted">
              Signed in as
            </p>
            <div className="mt-2 flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-background text-text-muted">
                <UserCircle size={20} aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-text-main">
                  {identity.displayName}
                </p>
                <p className="mt-0.5 truncate text-xs text-text-muted">{identity.email}</p>
                {identity.role ? (
                  <p className="mt-1 inline-flex rounded-full border border-app-border bg-app-background px-2 py-0.5 text-[0.68rem] font-semibold text-text-muted">
                    {identity.role}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
          <div className="border-b border-app-border px-4 py-3">
            <div className="flex items-start gap-3 rounded-xl bg-app-background px-3 py-2.5">
              <Clock3 size={16} className="mt-0.5 shrink-0 text-text-muted" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-text-main">{sessionStatus.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-text-muted">
                  {sessionStatus.description}
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-2 p-2">
            {menuSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 pt-2 text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">
                  {section.title}
                </p>
                <div className="mt-1 grid gap-1">
                  {section.items.map((item) => (
                    <MenuButton
                      key={item.view}
                      icon={item.icon}
                      label={item.label}
                      description={item.description}
                      onClick={() => navigate(item.view)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="grid gap-1 border-t border-app-border p-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-status-danger transition hover:bg-status-dangerBg disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
              role="menuitem"
            >
              <LogOut size={16} aria-hidden="true" />
              {signingOutMode === "current" ? "Signing out..." : "Sign out"}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-status-danger transition hover:bg-status-dangerBg disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSignOutEverywhere}
              disabled={isSigningOut}
              role="menuitem"
            >
              <LogOut size={16} aria-hidden="true" />
              {signingOutMode === "everywhere"
                ? "Signing out everywhere..."
                : "Sign out from all devices"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({ icon: Icon, label, description, onClick }) {
  return (
    <button
      type="button"
      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-app-background"
      onClick={onClick}
      role="menuitem"
    >
      <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text-main">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">{description}</span>
      </span>
    </button>
  );
}
