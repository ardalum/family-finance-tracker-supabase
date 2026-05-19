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
        iconVariant: "slate",
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
        iconVariant: "slate",
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
        iconVariant: "amber",
      },
      {
        icon: DatabaseBackup,
        label: "Backup & Restore",
        description: "Export data and manage restore/import safety workflows.",
        view: "backup",
        iconVariant: "amber",
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
        iconVariant: "neutral",
      },
      {
        icon: BookOpenText,
        label: "Release Notes",
        description: "Recent app changes, cleanup passes, and improvements.",
        view: "release-notes",
        iconVariant: "neutral",
      },
      {
        icon: Info,
        label: "About Spedger",
        description: "App purpose, version notes, and credits.",
        view: "about",
        iconVariant: "neutral",
      },
    ],
  },
];
