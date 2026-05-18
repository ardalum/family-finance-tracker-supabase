import {
  ActivitySquare,
  CalendarDays,
  CircleHelp,
  DatabaseBackup,
  HandCoins,
  Landmark,
  PiggyBank,
  Scale,
  Settings,
  ShieldCheck,
  TrendingUp,
  WalletCards,
  BookOpenText,
  Info,
} from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";

const toolGroups = [
  {
    title: "Planning & Overview",
    description: "Track upcoming dates and overall household position.",
    items: [
      {
        view: "calendar",
        label: "Calendar",
        description: "Review upcoming card, bill, income, and month-close dates.",
        icon: CalendarDays,
      },
      {
        view: "financial-position",
        label: "Financial Position",
        description: "Review income, savings, cash, debt, and net worth in one place.",
        icon: ActivitySquare,
      },
      {
        view: "net-worth",
        label: "Net Worth",
        description: "Track assets, liabilities, and monthly net worth movement.",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "Money Setup",
    description: "Maintain records used by planning and reporting views.",
    items: [
      {
        view: "income",
        label: "Income",
        description: "Manage income sources and monthly income entries.",
        icon: HandCoins,
      },
      {
        view: "savings",
        label: "Savings",
        description: "Track savings goals and monthly contributions.",
        icon: PiggyBank,
      },
      {
        view: "accounts",
        label: "Accounts",
        description: "Log account balance snapshots for cash position visibility.",
        icon: Landmark,
      },
      {
        view: "liabilities",
        label: "Liabilities / Debt",
        description: "Track liability balances and debt snapshots.",
        icon: Scale,
      },
    ],
  },
  {
    title: "Data & Maintenance",
    description: "Manage exports, backups, and app-level preferences.",
    items: [
      {
        view: "backup",
        label: "Backup & Restore",
        description: "Export data and manage restore/import safety workflows.",
        icon: DatabaseBackup,
      },
      {
        view: "app-settings",
        label: "App Settings",
        description: "Adjust display preferences and app behavior.",
        icon: Settings,
      },
    ],
  },
  {
    title: "Help & Trust",
    description: "Review support, legal, and release information.",
    items: [
      {
        view: "privacy-policy",
        label: "Data & Privacy",
        description: "Review data handling, privacy policy, and deletion notes.",
        icon: ShieldCheck,
      },
      {
        view: "help-support",
        label: "Help / Support",
        description: "Get troubleshooting guidance and support details.",
        icon: CircleHelp,
      },
      {
        view: "release-notes",
        label: "Release Notes",
        description: "See recent WalletFlow changes and hardening updates.",
        icon: BookOpenText,
      },
      {
        view: "about",
        label: "About WalletFlow",
        description: "Learn about scope, version, and project direction.",
        icon: Info,
      },
    ],
  },
];

export default function Tools() {
  return (
    <section className="grid gap-6">
      {toolGroups.map((group) => (
        <Card key={group.title} className="overflow-hidden">
          <div className="border-b border-app-border p-5">
            <h3 className="text-base font-semibold text-text-main">{group.title}</h3>
            <p className="mt-1 text-sm text-text-muted">{group.description}</p>
          </div>
          <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            {group.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.view}
                  type="button"
                  className="grid gap-2 rounded-2xl border border-app-border bg-app-surface p-4 text-left transition hover:border-brand-primary/40 hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  onClick={() => dispatchNavigation(item.view)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-app-background text-text-main ring-1 ring-inset ring-app-border">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <span className="text-sm font-semibold text-text-main">{item.label}</span>
                  <span className="text-xs text-text-muted">{item.description}</span>
                </button>
              );
            })}
          </div>
        </Card>
      ))}
    </section>
  );
}

export { toolGroups };
