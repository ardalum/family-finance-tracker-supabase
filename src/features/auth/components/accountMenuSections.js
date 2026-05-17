import {
  ClipboardList,
  HandCoins,
  PiggyBank,
  DatabaseBackup,
  Home,
  Info,
  LifeBuoy,
  Settings,
  ShieldCheck,
  UserCircle,
} from "lucide-react";
import { AUTH_VIEW_TARGETS } from "../authViewTargets.js";

export const accountMenuSections = [
  {
    title: "Account",
    items: [
      {
        icon: UserCircle,
        label: "Account Settings",
        description: "Profile identity, session details, and sign-out controls.",
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
        icon: HandCoins,
        label: "Income",
        description: "Manual income sources and monthly income entries.",
        view: "income",
      },
      {
        icon: PiggyBank,
        label: "Savings",
        description: "Manual savings goals and monthly contributions.",
        view: "savings",
      },
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
