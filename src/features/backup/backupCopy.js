export const backupTrustCopy = {
  importSafetyHeading: "Import Supabase Backup",
  importSafetyDescription:
    "Merge mode adds missing records and skips records that are already present. It will not delete existing data.",
  importSafetyReminder:
    "Review your backup before importing. Invalid JSON is rejected, and only import files you trust.",
  importMergeWarning:
    "Merge import adds missing records and skips already-matched records. Computed summaries (cash-flow/Net Worth/Financial Position/Insights outputs) are not restored as standalone records.",
  importAcknowledgement:
    "I reviewed the preview and understand this will merge the backup into the current household without deleting existing data.",
  destructiveResetLabel: "Reset Household Finance Data",
  destructiveResetWarning:
    "This action permanently deletes active-household finance records and cannot be undone.",
  destructiveDeleteLabel: "Delete Account and Household Access",
  destructiveDeleteWarning:
    "This action permanently deletes your login account and private household access for eligible owner-only households.",
};
