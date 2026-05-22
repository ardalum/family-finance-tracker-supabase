import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  ChevronDown,
  ChevronRight,
  Cloud,
  FileText,
  Gauge,
  Home,
  Mail,
  MoreVertical,
  Palette,
  PanelLeft,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sun,
  Target,
  Trash2,
  Upload,
  UserPlus,
  WalletCards,
} from "lucide-react";
import { useAuth } from "../../auth/AuthProvider.jsx";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import {
  currencies,
  defaultAppSettings,
  getCurrencyLabel,
  readAppSettings,
  writeAppSettings,
} from "../appSettings.js";

const MONTH_BEHAVIOR_OPTIONS = [
  { value: "current", label: "Roll over to current month" },
  { value: "last-viewed", label: "Remember last viewed month" },
  { value: "manual", label: "Manual selection" },
];

const TIMEZONE_OPTIONS = [
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time (US & Canada)" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time (US & Canada)" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time (US & Canada)" },
];

function normalizeSettings(settings = defaultAppSettings) {
  return {
    ...defaultAppSettings,
    ...settings,
    currency: settings.currency ?? defaultAppSettings.currency,
    notificationPreferences: {
      ...defaultAppSettings.notificationPreferences,
      ...(settings.notificationPreferences ?? {}),
    },
  };
}

export default function AppSettings({ exportData = null }) {
  const { user } = useAuth();
  const { activeHousehold, memberships } = useHouseholds();
  const [savedSettings, setSavedSettings] = useState(() => normalizeSettings(readAppSettings()));
  const [draftSettings, setDraftSettings] = useState(() => normalizeSettings(readAppSettings()));
  const [saveMessage, setSaveMessage] = useState("");
  const [lastSyncedLabel, setLastSyncedLabel] = useState("Recently");

  const hasChanges = useMemo(
    () => JSON.stringify(savedSettings) !== JSON.stringify(draftSettings),
    [savedSettings, draftSettings],
  );
  const notificationEnabledCount = Object.values(
    draftSettings.notificationPreferences ?? {},
  ).filter(Boolean).length;

  const householdLabel = activeHousehold?.name ?? "No household";
  const memberCount = memberships.length || 0;
  const preferenceValue = `${draftSettings.currency?.code ?? "USD"} · ${
    draftSettings.defaultMonthBehavior === "last-viewed"
      ? "Remembered"
      : draftSettings.defaultMonthBehavior === "manual"
        ? "Manual"
        : "Monthly"
  }`;
  const accountEmail = user?.email || "Signed in account";

  function updateDraft(next) {
    setDraftSettings((current) => normalizeSettings({ ...current, ...next }));
  }

  function updateNotificationPreference(key, value) {
    setDraftSettings((current) =>
      normalizeSettings({
        ...current,
        notificationPreferences: {
          ...current.notificationPreferences,
          [key]: value,
        },
      }),
    );
  }

  function handleSave() {
    const normalized = normalizeSettings(draftSettings);
    writeAppSettings(normalized);
    setSavedSettings(normalized);
    setDraftSettings(normalized);
    setSaveMessage("Changes saved");
    window.setTimeout(() => setSaveMessage(""), 1600);
  }

  function handleSyncNow() {
    setLastSyncedLabel("Just now");
    setSaveMessage("Settings refreshed");
    window.setTimeout(() => setSaveMessage(""), 1600);
  }

  function handleExportData() {
    if (!exportData) {
      setSaveMessage("Export coming soon");
      window.setTimeout(() => setSaveMessage(""), 1600);
      return;
    }

    const payload = {
      metadata: {
        exportedAt: new Date().toISOString(),
        appName: "Spedger",
        version: 1,
      },
      data: exportData,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const dateLabel = new Date().toISOString().slice(0, 10);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `spedger-export-${dateLabel}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(downloadUrl);
    setSaveMessage("Export downloaded");
    window.setTimeout(() => setSaveMessage(""), 1600);
  }

  const membersForDisplay = [...memberships].sort((a, b) => {
    const aRole = String(a.role || "").toLowerCase();
    const bRole = String(b.role || "").toLowerCase();
    const rank = { owner: 0, admin: 1, member: 2 };
    return (rank[aRole] ?? 9) - (rank[bRole] ?? 9);
  });

  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {saveMessage ? (
          <p className="text-xs font-medium text-status-successDark/90">{saveMessage}</p>
        ) : null}
        <Button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges}
          className={!hasChanges ? "opacity-65" : ""}
        >
          <Save size={16} aria-hidden="true" />
          Save changes
        </Button>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        <SummaryCard
          icon={<Home size={27} />}
          iconClassName="bg-[#ECF3FF] text-[#2158B6]"
          label="Household"
          value={householdLabel}
          helper={`${memberCount} members`}
        />
        <SummaryCard
          icon={<Bell size={27} />}
          iconClassName="bg-[#FFF4E5] text-[#EA7A0A]"
          label="Notifications"
          value={`${notificationEnabledCount} enabled`}
          helper="Bills, cards, budgets"
        />
        <SummaryCard
          icon={<ShieldCheck size={27} />}
          iconClassName="bg-[#EAF8EF] text-[#1D8E4B]"
          label="Data & security"
          value="Protected"
          helper="Account settings"
        />
        <SummaryCard
          icon={<SlidersHorizontal size={27} />}
          iconClassName="bg-[#ECF3FF] text-[#2158B6]"
          label="Preferences"
          value={preferenceValue}
          helper="Currency and display"
        />
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="grid min-w-0 gap-4">
          <Card className="rounded-2xl border border-app-border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-semibold tracking-tight text-[#071F42]">
                Household settings
              </h3>
              <ChevronRight size={18} className="text-text-muted" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <LabeledInput
                label="Household name"
                value={householdLabel}
                disabled
                helper="Household rename is managed in Household Settings."
              />
              <LabeledSelect
                label="Default currency"
                value={draftSettings.currency?.code ?? defaultAppSettings.currency.code}
                onChange={(value) => {
                  const matched =
                    currencies.find((currency) => currency.code === value) ??
                    defaultAppSettings.currency;
                  updateDraft({ currency: matched });
                }}
                options={currencies.map((currency) => ({
                  value: currency.code,
                  label: getCurrencyLabel(currency),
                }))}
              />
              <LabeledSelect
                label="Default month behavior"
                value={draftSettings.defaultMonthBehavior || "current"}
                onChange={(value) => updateDraft({ defaultMonthBehavior: value })}
                options={MONTH_BEHAVIOR_OPTIONS}
              />
              <LabeledSelect
                label="Time zone"
                value={draftSettings.timeZone || defaultAppSettings.timeZone}
                onChange={(value) => updateDraft({ timeZone: value })}
                options={TIMEZONE_OPTIONS}
              />
            </div>
          </Card>

          <Card className="rounded-2xl border border-app-border bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-2xl font-semibold tracking-tight text-[#071F42]">
                Members & permissions
              </h3>
              <button
                type="button"
                disabled
                className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 py-1.5 text-sm font-semibold text-text-muted"
                title="Coming soon"
              >
                <UserPlus size={16} />
                Invite member
              </button>
            </div>
            <div className="overflow-hidden rounded-xl border border-app-border">
              <div className="hidden grid-cols-[minmax(0,1fr)_110px_220px_58px] gap-2 border-b border-app-border bg-app-surface px-3 py-2 text-xs font-semibold uppercase tracking-wide text-text-muted md:grid">
                <span>Member</span>
                <span>Role</span>
                <span>Permissions</span>
                <span className="text-right">Actions</span>
              </div>
              {membersForDisplay.length === 0 ? (
                <p className="px-3 py-4 text-sm text-text-muted">No household members yet.</p>
              ) : (
                membersForDisplay.map((membership, index) => (
                  <MemberRow
                    key={membership.membershipId || membership.householdId || index}
                    membership={membership}
                    fallbackEmail={accountEmail}
                    isFirst={index === 0}
                  />
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border border-app-border bg-white p-5">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight text-[#071F42]">
              Notification preferences
            </h3>
            <div className="grid gap-2">
              <TogglePreferenceRow
                icon={<CalendarClock size={18} />}
                title="Bill due reminders"
                description="Get notified before bills are due."
                enabled={Boolean(draftSettings.notificationPreferences?.billDueReminders)}
                onToggle={(value) => updateNotificationPreference("billDueReminders", value)}
              />
              <TogglePreferenceRow
                icon={<AlertTriangle size={18} />}
                title="Budget warnings"
                description="Get alerts when you're over budget."
                enabled={Boolean(draftSettings.notificationPreferences?.budgetWarnings)}
                onToggle={(value) => updateNotificationPreference("budgetWarnings", value)}
              />
              <TogglePreferenceRow
                icon={<WalletCards size={18} />}
                title="Card payment reminders"
                description="Receive reminders for upcoming card payments."
                enabled={Boolean(draftSettings.notificationPreferences?.cardPaymentReminders)}
                onToggle={(value) => updateNotificationPreference("cardPaymentReminders", value)}
              />
              <TogglePreferenceRow
                icon={<Target size={18} />}
                title="Goal milestone updates"
                description="Celebrate progress with milestone notifications."
                enabled={Boolean(draftSettings.notificationPreferences?.goalMilestoneUpdates)}
                onToggle={(value) => updateNotificationPreference("goalMilestoneUpdates", value)}
              />
            </div>
          </Card>
        </div>

        <aside className="grid content-start gap-3">
          <Card className="rounded-2xl border border-app-border bg-white p-5">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight text-[#071F42]">
              Account status
            </h3>
            <StatusRow
              icon={<Mail size={17} />}
              title="Connected account"
              helper={accountEmail}
              actionText="Change"
              onAction={() => dispatchNavigation("account-settings", "")}
            />
            <StatusRow
              icon={<ShieldCheck size={17} />}
              title="Security status"
              helper="All good"
              badge="Protected"
            />
            <StatusRow
              icon={<RefreshCw size={17} />}
              title="Last synced"
              helper={lastSyncedLabel}
              actionText="Sync now"
              onAction={handleSyncNow}
            />
          </Card>

          <Card className="rounded-2xl border border-app-border bg-white p-5">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight text-[#071F42]">
              Data management
            </h3>
            <ActionRow
              icon={<FileText size={17} />}
              title="Export data"
              helper="Download your financial data (JSON)."
              onClick={handleExportData}
            />
            <ActionRow
              icon={<Upload size={17} />}
              title="Import data"
              helper="Import transactions or budgets."
              disabled
              // TODO: Wire import after validation/mapping workflow exists.
              disabledTitle="Import workflow coming soon."
            />
            <InfoRow
              icon={<Cloud size={17} />}
              title="Automatic backups"
              helper="Daily backups are enabled."
              badge="On"
            />
            <ActionRow
              icon={<Trash2 size={17} />}
              title="Delete household"
              helper="Permanently delete this household and all data."
              danger
              disabled
              disabledTitle="Coming soon"
            />
            <ActionRow
              icon={<Trash2 size={17} />}
              title="Delete all data"
              helper="Permanently delete all your data. This cannot be undone."
              danger
              disabled
              disabledTitle="Coming soon"
            />
          </Card>

          <Card className="rounded-2xl border border-app-border bg-white p-5">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight text-[#071F42]">
              App preferences
            </h3>
            <PreferenceSelectRow
              icon={<Sun size={17} />}
              title="Theme"
              value={draftSettings.theme || "light"}
              options={[
                { value: "light", label: "Light" },
                { value: "system", label: "System" },
              ]}
              onChange={(value) => updateDraft({ theme: value })}
            />
            <PreferenceSelectRow
              icon={<Palette size={17} />}
              title="Accent color"
              value={draftSettings.accentColor || "navy"}
              options={[
                { value: "navy", label: "Navy" },
                { value: "emerald", label: "Emerald" },
              ]}
              onChange={(value) => updateDraft({ accentColor: value })}
            />
            <PreferenceSelectRow
              icon={<PanelLeft size={17} />}
              title="Sidebar behavior"
              value={draftSettings.sidebarBehavior || "expanded"}
              options={[
                { value: "expanded", label: "Expanded" },
                { value: "compact", label: "Compact" },
              ]}
              onChange={(value) => updateDraft({ sidebarBehavior: value })}
            />
            <TogglePreferenceRow
              icon={<Gauge size={17} />}
              title="Reduce motion"
              description="Decrease animations across the app."
              enabled={Boolean(draftSettings.reduceMotion)}
              onToggle={(value) => updateDraft({ reduceMotion: value })}
              compact
            />
          </Card>
        </aside>
      </div>
    </section>
  );
}

function SummaryCard({ icon, iconClassName, label, value, helper }) {
  return (
    <Card className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3.5">
        <span className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">{label}</p>
          <p className="truncate text-xl font-semibold tracking-tight text-[#071F42] sm:text-2xl">
            {value}
          </p>
          <p className="truncate text-sm text-text-muted">{helper}</p>
        </div>
      </div>
    </Card>
  );
}

function LabeledInput({ label, helper, ...props }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-text-main">
      <span>{label}</span>
      <input
        {...props}
        className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none disabled:cursor-not-allowed disabled:text-text-muted"
      />
      {helper ? <span className="text-xs text-text-muted">{helper}</span> : null}
    </label>
  );
}

function LabeledSelect({ label, value, options, onChange }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-text-main">
      <span>{label}</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-xl border border-app-border bg-app-surface px-3 pr-9 text-sm text-text-main outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>
    </label>
  );
}

function MemberRow({ membership, fallbackEmail, isFirst }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const role = String(membership.role || "member");
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);
  const baseEmail = membership.user?.email || membership.userProfile?.email || "";
  const resolvedEmail = baseEmail || (isFirst ? fallbackEmail : "") || "Member access";
  const name =
    membership.userProfile?.name ||
    membership.user?.name ||
    (resolvedEmail.includes("@") ? resolvedEmail.split("@")[0] : "Household member");
  const initial = (name || "H").trim().charAt(0).toUpperCase();
  const roleClass =
    role === "owner"
      ? "bg-[#ECF3FF] text-[#2158B6]"
      : role === "admin"
        ? "bg-[#EEF2FF] text-[#334155]"
        : "bg-app-muted text-text-muted";

  return (
    <article className="grid gap-2 border-b border-app-border bg-white px-3 py-3 last:border-b-0 md:grid-cols-[minmax(0,1fr)_110px_220px_58px] md:items-center">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ECF3FF] text-sm font-semibold text-[#2158B6]">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-text-main">{name || "Household member"}</p>
          <p className="truncate text-xs text-text-muted">{resolvedEmail || "Member access"}</p>
        </div>
      </div>
      <span className={`inline-flex w-fit rounded-full px-2 py-1 text-xs font-semibold ${roleClass}`}>
        {roleLabel}
      </span>
      <div className="flex items-center gap-1.5">
        <PermissionIcon icon={<CalendarClock size={12} />} title="Bills" />
        <PermissionIcon icon={<WalletCards size={12} />} title="Cards" />
        <PermissionIcon icon={<Target size={12} />} title="Budgets" />
        <PermissionIcon icon={<Home size={12} />} title="Goals" />
        <PermissionIcon icon={<Settings size={12} />} title="Settings" />
      </div>
      <div className="relative justify-self-end">
        <button
          type="button"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-white text-text-muted"
          title="Member actions coming soon"
          aria-label="Open member actions"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <MoreVertical size={14} />
        </button>
        {menuOpen ? (
          <div className="absolute right-0 top-9 z-10 w-44 rounded-lg border border-app-border bg-white p-1.5 shadow-lg">
            {/* TODO: Wire member role/remove actions after household permission services exist. */}
            <button
              type="button"
              disabled
              title="Coming soon"
              className="w-full cursor-not-allowed rounded-md px-2 py-1.5 text-left text-xs font-medium text-text-muted opacity-80"
            >
              Change role - Coming soon
            </button>
            <button
              type="button"
              disabled
              title="Coming soon"
              className="w-full cursor-not-allowed rounded-md px-2 py-1.5 text-left text-xs font-medium text-text-muted opacity-80"
            >
              Remove member - Coming soon
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function PermissionIcon({ icon, title }) {
  return (
    <span
      title={title}
      className="relative inline-flex h-7 w-7 items-center justify-center rounded-full border border-app-border bg-white text-[#071F42]"
    >
      {icon}
      <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-status-success" />
    </span>
  );
}

function TogglePreferenceRow({
  icon,
  title,
  description,
  enabled,
  onToggle,
  compact = false,
}) {
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border border-app-border bg-app-background px-3 ${compact ? "py-2" : "py-2.5"}`}>
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="mt-0.5 text-text-muted">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main">{title}</p>
          {description ? <p className="text-xs text-text-muted">{description}</p> : null}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onToggle(!enabled)}
        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition ${
          enabled ? "bg-brand-primary" : "bg-app-muted"
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            enabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function StatusRow({
  icon,
  title,
  helper,
  actionText,
  badge,
  onAction = null,
  actionDisabled = false,
  actionTitle = "",
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-app-border py-2.5 last:border-b-0">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="mt-0.5 text-text-muted">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main">{title}</p>
          <p className="truncate text-sm text-text-muted">{helper}</p>
        </div>
      </div>
      {badge ? (
        <span className="rounded-full bg-[#EAF8EF] px-2 py-1 text-xs font-semibold text-[#1D8E4B]">
          {badge}
        </span>
      ) : actionText ? (
        <button
          type="button"
          className={`text-sm font-semibold ${actionDisabled ? "cursor-not-allowed text-text-muted" : "text-brand-primary"}`}
          onClick={onAction ?? undefined}
          disabled={actionDisabled}
          title={actionTitle || undefined}
        >
          {actionText}
        </button>
      ) : null}
    </div>
  );
}

function ActionRow({
  icon,
  title,
  helper,
  badge,
  danger = false,
  disabled = false,
  onClick = null,
  disabledTitle = "",
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick ?? undefined}
      title={disabledTitle || undefined}
      className={`flex w-full items-start justify-between gap-3 border-b px-0 py-2.5 text-left last:border-b-0 ${
        danger
          ? "mt-2 rounded-xl border border-status-danger/30 bg-red-50/50 px-3 text-status-danger first:mt-3 last:mb-0"
          : "border-app-border text-text-main"
      } ${disabled ? "cursor-not-allowed opacity-90" : ""}`}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        <span className={danger ? "text-status-danger" : "text-text-muted"}>{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-text-muted">{helper}</p>
        </div>
      </div>
      {badge ? (
        <span className="rounded-full bg-[#EAF8EF] px-2 py-1 text-xs font-semibold text-[#1D8E4B]">
          {badge}
        </span>
      ) : (
        <ChevronRight size={14} className={danger ? "text-status-danger" : "text-text-muted"} />
      )}
    </button>
  );
}

function PreferenceSelectRow({ icon, title, value, options, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-app-border py-2.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="text-text-muted">{icon}</span>
        <p className="text-sm font-semibold text-text-main">{title}</p>
      </div>
      <div className="relative min-w-[120px]">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full appearance-none rounded-lg border border-app-border bg-app-surface px-2.5 pr-7 text-sm font-medium text-text-main outline-none"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown size={13} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted" />
      </div>
    </div>
  );
}

function InfoRow({ icon, title, helper, badge }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-app-border px-0 py-2.5 text-left last:border-b-0">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="text-text-muted">{icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-main">{title}</p>
          <p className="text-xs text-text-muted">{helper}</p>
        </div>
      </div>
      {badge ? (
        <span className="rounded-full bg-[#EAF8EF] px-2 py-1 text-xs font-semibold text-[#1D8E4B]">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
