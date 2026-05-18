import {
  BookOpenText,
  DatabaseBackup,
  Home,
  Info,
  LifeBuoy,
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
        description: "Profile identity, security, and session controls.",
        view: AUTH_VIEW_TARGETS.accountSettings,
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
    title: "Privacy & Data",
    items: [
      {
        icon: ShieldCheck,
        label: "Data & Privacy",
        description: "Privacy policy, data handling, exports, and deletion notes.",
        view: "privacy-policy",
      },
      {
        icon: DatabaseBackup,
        label: "Backup & Restore",
        description: "Export data and manage restore/import safety workflows.",
        view: "backup",
      },
    ],
  },
  {
    title: "Support",
    items: [
      {
        icon: LifeBuoy,
        label: "Help / Support",
        description: "Troubleshooting notes, safe testing reminders, and contact info.",
        view: "help-support",
      },
      {
        icon: BookOpenText,
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
