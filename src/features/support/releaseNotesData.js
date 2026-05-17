import { appMetadata } from "../../app/appMetadata.js";

export const releaseNotesHero = {
  eyebrow: `WalletFlow v${appMetadata.version}`,
  title: "Release Notes",
  description: "Review recent WalletFlow changes, cleanup passes, and user-facing improvements.",
};

export const releaseNotes = [
  {
    version: "Monthly close and product hardening",
    date: "May 2026",
    items: [
      "Added the Monthly Close Checklist MVP on Dashboard to guide month-end review using existing app data.",
      "Added persisted monthly close review state by household/month, including manual checks and reviewed/in-progress status.",
      "Completed product-completeness fixes for Account Settings and App Settings so working controls and destinations are explicit.",
      "Applied smoke-test follow-up fixes, including clearer backup wording and production QA/backlog documentation updates.",
    ],
  },
  {
    version: appMetadata.releaseLabel,
    date: appMetadata.releaseDate,
    items: [
      "Renamed primary navigation labels to Dashboard, Cards, Budget, Spending, Bills, and Insights.",
      "Added Privacy Policy and Terms of Use pages.",
      "Enabled footer links for Privacy Policy, Terms of Use, and About.",
      "Added account menu access to support and release information.",
    ],
  },
  {
    version: "Frontend architecture cleanup",
    date: "May 2026",
    items: [
      "Moved feature data logic into focused hooks.",
      "Kept App.jsx focused on orchestration and app wiring.",
      "Added project verification scripts for formatting, build, tests, and lint.",
    ],
  },
];
