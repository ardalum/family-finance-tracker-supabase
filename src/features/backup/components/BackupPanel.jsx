import { useRef, useState } from "react";
import { CloudDownload, Download, FileSpreadsheet, RotateCcw, Trash2, Upload } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { signOut } from "../../auth/authService.js";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import {
  exportBackup,
  exportSupabaseBackup,
  exportSupabaseExcel,
  importSupabaseBackupMerge,
  deleteSupabaseAccount,
  importBackupFile,
  previewSupabaseBackupImport,
  resetAllData,
  resetSupabaseHouseholdFinanceData,
} from "../backupService.js";
import { getHouseholdFinanceDeletePhrase } from "../secureDeletionService.js";

const summaryLabels = {
  householdProfiles: "Household profiles",
  creditCards: "Credit cards",
  monthlyCardBalances: "Monthly balances",
  cardStatements: "Card statements",
  budgetCategories: "Budget categories",
  transactions: "Transactions",
  transactionSplits: "Transaction splits",
  recurringPayments: "Recurring payments",
  recurringPaymentInstances: "Recurring instances",
  monthlyCloseReviews: "Monthly close reviews",
  incomeSources: "Income sources",
  incomeEntries: "Income entries",
  savingsGoals: "Savings goals",
  savingsContributions: "Savings contributions",
  cashAccounts: "Cash accounts",
  accountBalanceSnapshots: "Account balance snapshots",
  liabilityAccounts: "Liability accounts",
  liabilityBalanceSnapshots: "Liability snapshots",
};

function getCountTotals(counts) {
  return Object.keys(summaryLabels).reduce(
    (totals, key) => ({
      imported: totals.imported + Number(counts?.[key]?.imported || 0),
      skipped: totals.skipped + Number(counts?.[key]?.skipped || 0),
    }),
    { imported: 0, skipped: 0 },
  );
}

function getImportResultMessage(counts) {
  const totals = getCountTotals(counts);
  return `Import completed. ${totals.imported} record${totals.imported === 1 ? "" : "s"} imported and ${totals.skipped} skipped.`;
}

export default function BackupPanel({ onDataChange, onSupabaseImportComplete }) {
  const { activeHouseholdId, activeHousehold } = useHouseholds();
  const inputRef = useRef(null);
  const cloudInputRef = useRef(null);
  const [message, setMessage] = useState(null);
  const [isExportingCloud, setIsExportingCloud] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isPreviewingCloudImport, setIsPreviewingCloudImport] = useState(false);
  const [isImportingCloud, setIsImportingCloud] = useState(false);
  const [isWorkingLegacy, setIsWorkingLegacy] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isResettingFinanceData, setIsResettingFinanceData] = useState(false);
  const [deleteAccountPhrase, setDeleteAccountPhrase] = useState("");
  const [resetFinancePhrase, setResetFinancePhrase] = useState("");
  const [cloudImport, setCloudImport] = useState(null);
  const [importAcknowledged, setImportAcknowledged] = useState(false);

  function showMessage(result) {
    setMessage({
      type: result.ok ? "success" : "error",
      text: result.message,
    });
  }

  async function handleSupabaseExport() {
    setIsExportingCloud(true);
    setMessage(null);

    try {
      showMessage(await exportSupabaseBackup(activeHouseholdId, activeHousehold));
    } finally {
      setIsExportingCloud(false);
    }
  }

  async function handleExcelExport() {
    setIsExportingExcel(true);
    setMessage(null);

    try {
      showMessage(await exportSupabaseExcel(activeHouseholdId, activeHousehold));
    } finally {
      setIsExportingExcel(false);
    }
  }

  function handleExport() {
    showMessage(exportBackup());
  }

  function handleImportClick() {
    inputRef.current?.click();
  }

  function handleCloudImportClick() {
    cloudInputRef.current?.click();
  }

  async function handleCloudImportFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    setCloudImport(null);
    setImportAcknowledged(false);
    setMessage(null);
    setIsPreviewingCloudImport(true);

    try {
      const result = await previewSupabaseBackupImport(file, activeHouseholdId);
      if (!result.ok) {
        showMessage(result);
        return;
      }

      setCloudImport({
        backup: result.backup,
        preview: result.preview,
        fileName: file.name,
      });
      showMessage(result);
    } finally {
      setIsPreviewingCloudImport(false);
    }
  }

  async function handleCloudImportConfirm() {
    if (!cloudImport?.backup) return;

    if (!importAcknowledged) {
      setMessage({
        type: "error",
        text: "Review the preview and confirm that you want to merge this backup before importing.",
      });
      return;
    }

    setIsImportingCloud(true);
    setMessage(null);

    try {
      const result = await importSupabaseBackupMerge(activeHouseholdId, cloudImport.backup);

      if (result.ok) {
        setCloudImport({
          ...cloudImport,
          result: result.counts,
        });
        setMessage({
          type: "success",
          text: getImportResultMessage(result.counts),
        });
        await onSupabaseImportComplete?.();
      } else {
        showMessage(result);
      }
    } finally {
      setIsImportingCloud(false);
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    event.target.value = "";

    const confirmed = window.confirm(
      "Importing a backup will replace all current local data. Continue?",
    );
    if (!confirmed) return;

    setIsWorkingLegacy(true);
    const result = await importBackupFile(file);
    showMessage(result);
    if (result.ok) onDataChange(result.data);
    setIsWorkingLegacy(false);
  }

  function handleReset() {
    const confirmed = window.confirm(
      "Delete all local finance tracker data? This cannot be undone unless you have a backup.",
    );
    if (!confirmed) return;

    setIsWorkingLegacy(true);
    const result = resetAllData();
    showMessage(result);
    onDataChange(result.data);
    setIsWorkingLegacy(false);
  }

  const financeDeletePhrase = getHouseholdFinanceDeletePhrase();

  async function handleResetHouseholdFinanceData() {
    if (resetFinancePhrase !== financeDeletePhrase) return;

    const confirmed = window.confirm(
      "This will permanently delete household finance records for the active household, but keep your login account. Continue?",
    );
    if (!confirmed) return;

    setIsResettingFinanceData(true);
    setMessage(null);

    try {
      const result = await resetSupabaseHouseholdFinanceData(activeHouseholdId, resetFinancePhrase);
      showMessage(result);
      if (result.ok) {
        await signOut();
      }
    } finally {
      setIsResettingFinanceData(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteAccountPhrase !== "DELETE") return;

    const confirmed = window.confirm(
      "This will permanently delete your Supabase Auth login and private household data under strict owner/member checks. Continue?",
    );
    if (!confirmed) return;

    setIsDeletingAccount(true);
    setMessage(null);

    try {
      const result = await deleteSupabaseAccount(activeHouseholdId, deleteAccountPhrase);
      showMessage(result);
      if (result.ok) {
        await signOut();
      }
    } finally {
      setIsDeletingAccount(false);
    }
  }

  return (
    <div className="grid gap-5">
      <Card className="border-sky-200 bg-sky-50/40 p-5">
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">
              Primary backup
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">Supabase Cloud Backup</h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              Export the finance data for your active household from Supabase. This includes cards,
              monthly balances, card statements, budgets, transactions, splits, recurring payments,
              recurring instances, monthly close reviews, income, savings, cash-account snapshots,
              and liability debt snapshots. Auth tokens, passwords, and secret keys are not
              included.
            </p>
          </div>

          {message ? <Message message={message} /> : null}

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={handleSupabaseExport}
              disabled={isExportingCloud || !activeHouseholdId}
              className="bg-sky-700 hover:bg-sky-800"
            >
              <CloudDownload size={16} aria-hidden="true" />
              {isExportingCloud ? "Exporting..." : "Export Supabase Backup"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleExcelExport}
              disabled={isExportingExcel || !activeHouseholdId}
            >
              <FileSpreadsheet size={16} aria-hidden="true" />
              {isExportingExcel ? "Exporting..." : "Export to Excel"}
            </Button>
          </div>

          <p className="text-xs text-gray-500">
            Active household: {activeHousehold?.name ?? "No household selected"}
          </p>

          <div className="rounded-md border border-sky-100 bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-950">Import Supabase Backup</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Merge mode adds missing records and skips records that are already present. It
                  will not delete existing data.
                </p>
                <p className="mt-2 text-xs text-amber-700">
                  Recommended: Export a fresh Supabase backup before importing.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleSupabaseExport}
                  disabled={isExportingCloud || !activeHouseholdId}
                  className="min-h-9 px-3 py-1.5 text-xs"
                >
                  <CloudDownload size={14} aria-hidden="true" />
                  Export current first
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloudImportClick}
                  disabled={isPreviewingCloudImport || isImportingCloud || !activeHouseholdId}
                >
                  <Upload size={16} aria-hidden="true" />
                  {isPreviewingCloudImport ? "Reading..." : "Choose backup file"}
                </Button>
              </div>
            </div>

            {cloudImport ? (
              <div className="mt-4 grid gap-4">
                <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600">
                  Preview for{" "}
                  <span className="font-medium text-gray-900">{cloudImport.fileName}</span>
                </div>
                <ImportSummary counts={cloudImport.preview} mode="preview" />
                {cloudImport.result ? (
                  <div className="grid gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">Import completed</p>
                      <p className="mt-1 text-sm text-emerald-700">
                        Records shown as skipped were already present or safely matched during
                        merge.
                      </p>
                    </div>
                    <ImportSummary counts={cloudImport.result} mode="result" />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <label className="flex gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                      <input
                        className="mt-0.5 h-4 w-4 rounded border-amber-300 text-sky-700 focus:ring-sky-700"
                        type="checkbox"
                        checked={importAcknowledged}
                        onChange={(event) => setImportAcknowledged(event.target.checked)}
                      />
                      <span>
                        I reviewed the preview and understand this will merge the backup into the
                        current household without deleting existing data.
                      </span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        onClick={handleCloudImportConfirm}
                        disabled={isImportingCloud || !importAcknowledged}
                      >
                        <Upload size={16} aria-hidden="true" />
                        {isImportingCloud ? "Importing..." : "Merge backup"}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setCloudImport(null);
                          setImportAcknowledged(false);
                        }}
                        disabled={isImportingCloud}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            <input
              ref={cloudInputRef}
              className="hidden"
              type="file"
              accept="application/json,.json"
              onChange={handleCloudImportFile}
            />
          </div>
        </div>
      </Card>

      <Card className="border-red-200 bg-red-50/40 p-5">
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Danger Zone
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">
              Reset Household Finance Data
            </h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              This keeps your login account but permanently deletes the active household's finance
              records (cards, budgets, transactions, recurring data, and related records). You must
              be the active household owner.
            </p>
          </div>

          <div className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700">
            This action resets household finance data and cannot be undone.
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExcelExport}
              disabled={isExportingExcel || !activeHouseholdId}
            >
              <FileSpreadsheet size={16} aria-hidden="true" />
              Export to Excel before deleting
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSupabaseExport}
              disabled={isExportingCloud || !activeHouseholdId}
            >
              <CloudDownload size={16} aria-hidden="true" />
              Export JSON backup before deleting
            </Button>
          </div>

          <div className="grid max-w-sm gap-3">
            <Input
              label={`Type ${financeDeletePhrase} to confirm`}
              value={resetFinancePhrase}
              onChange={(event) => setResetFinancePhrase(event.target.value)}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="danger"
              onClick={handleResetHouseholdFinanceData}
              disabled={
                resetFinancePhrase !== financeDeletePhrase ||
                isResettingFinanceData ||
                !activeHouseholdId
              }
            >
              <Trash2 size={16} aria-hidden="true" />
              {isResettingFinanceData ? "Resetting..." : "Reset Household Finance Data"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="border-red-200 bg-red-50/40 p-5">
        <div className="grid gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-red-700">
              Danger Zone
            </p>
            <h2 className="mt-1 text-lg font-semibold text-gray-950">Delete Account</h2>
            <p className="mt-1 max-w-3xl text-sm text-gray-600">
              This permanently deletes your Supabase Auth login and the active household only when
              you are its only active member and owner. Shared households or extra households you
              created will block deletion. The service role key stays server-side in a Supabase Edge
              Function and is never exposed in this browser app.
            </p>
          </div>

          <div className="rounded-md border border-red-200 bg-white px-3 py-2 text-sm text-red-700">
            This action deletes your login account and the private household tied to it. Household
            reset above does not delete login access.
          </div>

          <div className="grid max-w-sm gap-3">
            <Input
              label="Type DELETE to confirm account deletion"
              value={deleteAccountPhrase}
              onChange={(event) => setDeleteAccountPhrase(event.target.value)}
              autoComplete="off"
            />
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteAccount}
              disabled={deleteAccountPhrase !== "DELETE" || isDeletingAccount || !activeHouseholdId}
            >
              <Trash2 size={16} aria-hidden="true" />
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <details className="group">
          <summary className="cursor-pointer list-none">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Legacy tools
                </p>
                <h2 className="mt-1 text-lg font-semibold text-gray-950">
                  Legacy localStorage Backup
                </h2>
                <p className="mt-1 max-w-3xl text-sm text-gray-500">
                  These tools only export, import, or reset old browser localStorage data. They do
                  not back up or restore your current Supabase cloud data.
                </p>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                Secondary
              </span>
            </div>
          </summary>

          <div className="mt-4 grid gap-4 border-t border-gray-100 pt-4">
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Use this only if you still need access to the original localStorage backup format.
              Supabase cloud backup import is available in the section above and is intentionally
              separate from these legacy tools.
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={handleExport}
                disabled={isWorkingLegacy}
              >
                <Download size={16} aria-hidden="true" />
                Export Legacy Backup
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleImportClick}
                disabled={isWorkingLegacy}
              >
                <Upload size={16} aria-hidden="true" />
                Import Legacy Backup
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleReset}
                disabled={isWorkingLegacy}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Reset Legacy Data
              </Button>
            </div>
          </div>
        </details>

        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="application/json,.json"
          onChange={handleImport}
        />
      </Card>
    </div>
  );
}

function ImportSummary({ counts, mode = "preview" }) {
  const totals = getCountTotals(counts);
  const importedLabel = mode === "result" ? "Imported" : "To import";
  const skippedLabel = mode === "result" ? "Skipped" : "Already present";

  return (
    <div className="overflow-hidden rounded-md border border-gray-200 bg-white">
      <div className="grid grid-cols-[1fr_auto_auto] bg-gray-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
        <span>Data type</span>
        <span className="text-right">{importedLabel}</span>
        <span className="text-right">{skippedLabel}</span>
      </div>
      {Object.entries(summaryLabels).map(([key, label]) => (
        <div
          key={key}
          className="grid grid-cols-[1fr_auto_auto] gap-4 border-t border-gray-100 px-3 py-2 text-sm"
        >
          <span className="text-gray-700">{label}</span>
          <span className="min-w-12 text-right font-medium text-gray-950">
            {counts?.[key]?.imported ?? 0}
          </span>
          <span className="min-w-12 text-right text-gray-500">{counts?.[key]?.skipped ?? 0}</span>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-t border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold">
        <span className="text-gray-900">Total</span>
        <span className="min-w-12 text-right text-gray-950">{totals.imported}</span>
        <span className="min-w-12 text-right text-gray-600">{totals.skipped}</span>
      </div>
    </div>
  );
}

function Message({ message }) {
  return (
    <div
      className={`rounded-md border px-3 py-2 text-sm ${
        message.type === "success"
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      {message.text}
    </div>
  );
}
