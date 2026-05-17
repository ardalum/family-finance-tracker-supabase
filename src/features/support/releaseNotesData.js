import { appMetadata } from "../../app/appMetadata.js";

export const releaseNotes = [
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
