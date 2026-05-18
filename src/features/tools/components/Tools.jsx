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
import FeatureIcon from "../../../components/ui/FeatureIcon.jsx";
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
        iconVariant: "teal",
      },
      {
        view: "financial-position",
        label: "Financial Position",
        description: "Review income, savings, cash, debt, and net worth in one place.",
        icon: ActivitySquare,
        iconVariant: "purple",
      },
      {
        view: "net-worth",
        label: "Net Worth",
        description: "Track assets, liabilities, and monthly net worth movement.",
        icon: TrendingUp,
        iconVariant: "indigo",
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
        iconVariant: "green",
      },
      {
        view: "savings",
        label: "Savings",
        description: "Track savings goals and monthly contributions.",
        icon: PiggyBank,
        iconVariant: "lime",
      },
      {
        view: "accounts",
        label: "Accounts",
        description: "Log account balance snapshots for cash position visibility.",
        icon: Landmark,
        iconVariant: "sky",
      },
      {
        view: "liabilities",
        label: "Liabilities / Debt",
        description: "Track liability balances and debt snapshots.",
        icon: Scale,
        iconVariant: "red",
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
        iconVariant: "amber",
      },
      {
        view: "app-settings",
        label: "App Settings",
        description: "Adjust display preferences and app behavior.",
        icon: Settings,
        iconVariant: "slate",
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
        iconVariant: "amber",
      },
      {
        view: "help-support",
        label: "Help / Support",
        description: "Get troubleshooting guidance and support details.",
        icon: CircleHelp,
        iconVariant: "neutral",
      },
      {
        view: "release-notes",
        label: "Release Notes",
        description: "See recent WalletFlow changes and hardening updates.",
        icon: BookOpenText,
        iconVariant: "neutral",
      },
      {
        view: "about",
        label: "About WalletFlow",
        description: "Learn about scope, version, and project direction.",
        icon: Info,
        iconVariant: "neutral",
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
              return (
                <button
                  key={item.view}
                  type="button"
                  className="grid gap-2 rounded-2xl border border-app-border bg-app-surface p-4 text-left transition hover:border-brand-primary/40 hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
                  onClick={() => dispatchNavigation(item.view)}
                >
                  <FeatureIcon icon={item.icon} variant={item.iconVariant} />
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
