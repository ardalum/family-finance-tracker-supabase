import { appMetadata } from "../../app/appMetadata.js";

export const releaseNotesHero = {
  eyebrow: `Spedger v${appMetadata.version}`,
  title: "Release Notes",
  description: "Review recent Spedger changes, cleanup passes, and user-facing improvements.",
};

export const releaseNotes = [
  {
    version: "Spedger real-data readiness candidate",
    date: "May 2026",
    items: [
      "Validated Monthly Close workflow readiness, including persisted month review state and manual check tracking by household/month.",
      "Completed account and app settings cleanup so active controls and page destinations are explicit and non-working preferences are clearly marked.",
      "Clarified backup and destructive-action guidance, including separation of Delete Account vs Reset Household Finance Data behavior.",
      "Hardened release documentation and smoke-test workflow for GitHub Pages deployment, Supabase migrations, and Edge Function verification.",
    ],
  },
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
